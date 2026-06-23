import styles from './Renderer.module.css'
import { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, RefObject, useEffect, useRef, useState } from "react";
import { Box3, DepthTexture, LinearFilter, PerspectiveCamera, RGBAFormat, Scene, Vector3, WebGLRenderer, WebGLRenderTarget } from "three";
import { calculateAspectRatio, disableTouchInteraction, enableTouchInteraction, isSafari, sendMessageToIframe } from './util';
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { SAOPass } from "three/examples/jsm/postprocessing/SAOPass";
import { CutOutRenderShaderPass } from './shaders/CutOutRenderShaderPass';
import { FXAAShaderPass } from './shaders/FXAAShaderPass';
import { CameraController } from './camera/Camera';
import { MouseInputHandler } from './camera/MouseInputHandler';
import { CameraHandler, CameraHandlerState } from './camera/CameraHandler';
import { TouchInputHandler } from './camera/TouchInputHandler';
import { createUIEventBus } from '@/events/UserInteractionEvents';
import { HandleMouseInteractionInformation, HandleTouchProgressCircle } from './RendererTouchUserInterface';
import { parseRequestFromChild, sendMessageToChild } from "rpc";
import { SoundService } from './sound/SoundService';
import { BackgroundSounds } from './BackgroundSounds';
import { UpdateAction } from '../scene-loader/AssetManager';
import { ActivatePhoneIframeUserDataKey, DisplayName, PhoneOverlayFallbackUserDataKey, PhotoFrameInteractionZoneName } from '../scene-loader/AssetLoaders';
import { getBrowserDimensions, getQualityLevel, hasPerfFlag, isDebug, type QualityLevel } from '../scene-loader/util';
import Stats from "three/examples/jsm/libs/stats.module";
import { setInitialCameraPosition } from './camera/states/CinematicCameraState';
import { getDisplay, getFrameProjectionObject, getPhoneProjectionObject, OpenPhoneOverlayUserDataKey } from './camera/states/util';
import { PhoneOverlay } from './PhoneOverlay';
import { PHONE_VIEW_TRANSITION_MS } from './camera/states/PhoneViewCameraState';

export interface RendererScenes {
  sourceScene: Scene,
  cutoutScene: Scene,
  cssScene: Scene
};

const createCamera = (fov: number, aspectRatio: number): PerspectiveCamera => {
  const camera = new PerspectiveCamera(fov, aspectRatio, 0.1, 1000);

  camera.position.z = 5;

  return camera;
}

function createRenderers(width: number, height: number, profile: RendererQualityProfile): [WebGLRenderer, CSS3DRenderer] {
  const webglRenderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });

  webglRenderer.shadowMap.enabled = false;
  webglRenderer.setPixelRatio(getRenderPixelRatio(profile));

  const cssRenderer = new CSS3DRenderer();

  webglRenderer.setSize(width, height);
  cssRenderer.setSize(width, height);

  return [webglRenderer, cssRenderer];
}

const resizeCamera = (camera: PerspectiveCamera, aspectRatio: number): void => {
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();
}

const resizeRenderers = (
  composer: EffectComposer,
  webGlRenderer: WebGLRenderer,
  cssRenderer: CSS3DRenderer,
  width: number,
  height: number,
  profile: RendererQualityProfile
): void => {
  const pixelRatio = getRenderPixelRatio(profile);

  webGlRenderer.setPixelRatio(pixelRatio);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(width, height);
  webGlRenderer.setSize(width, height);
  cssRenderer.setSize(width, height);
};

const createComposerTarget = (renderer: WebGLRenderer, width: number, height: number): WebGLRenderTarget => {
  const target = new WebGLRenderTarget(
    width,
    height, 
    { 
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      depthTexture: new DepthTexture(width, height)
    }
  );

  return target;
}

const createComposer = (renderer: WebGLRenderer, width: number, height: number, profile: RendererQualityProfile): EffectComposer => {
  const composer = new EffectComposer(renderer, createComposerTarget(renderer, width, height));
  composer.setPixelRatio(getRenderPixelRatio(profile));

  return composer;
}

const renderWebglContext = (composer: EffectComposer): void => {
  composer.render();
}

const renderCssContext = (scene: Scene, renderer: CSS3DRenderer, camera: PerspectiveCamera): void => {
  // The CSS renderer does something special to fix the rendering for Safari
  // We manually update the world matrix and inverse the transformations of the css elements.
  // This is due to safari rendering it incorrect when it is at 1, it now renders it correct, like all the other major browsers.
  camera.matrixWorldAutoUpdate = false;
  camera.updateMatrixWorld();

  if (isSafari()) {
    camera.matrixWorldInverse.elements[15] = -1;
  }

  renderer.render(scene, camera);

  camera.matrixWorldAutoUpdate = true;
}

interface RendererProps {
  loading: boolean,
  showMessage: boolean, 
  scenes: RendererScenes,
  actions: UpdateAction[],
}

type DesktopOverlayRect = {
  left: number,
  top: number,
  width: number,
  height: number,
};

const DesktopOverlayTransitionMs = 520;
const DesktopOverlayMinimumLoaderMs = 1800;
const DesktopOverlayExitMessageMs = 900;
const DesktopOverlayExitZoomDelayMs = DesktopOverlayTransitionMs + 140;
const PhoneOverlayOpenDelayMs = PHONE_VIEW_TRANSITION_MS + 40;
const ThrottledParentRenderIntervalMs = 500;

type DesktopExitStage = 'message' | null;
type RendererQualityProfile = {
  level: QualityLevel,
  maxPixelRatio: number,
  enableSao: boolean,
};

const RendererQualityProfiles: Record<QualityLevel, RendererQualityProfile> = {
  high: {
    level: 'high',
    maxPixelRatio: 1.45,
    enableSao: true,
  },
  medium: {
    level: 'medium',
    maxPixelRatio: 1.15,
    enableSao: false,
  },
  low: {
    level: 'low',
    maxPixelRatio: 1.0,
    enableSao: false,
  },
};
const projectedPhoneBox = new Box3();
const projectedPhoneCenter = new Vector3();
const projectedPhonePoint = new Vector3();
const projectedPhoneCorners = Array.from({ length: 8 }, () => new Vector3());
const projectedFrameBox = new Box3();
const projectedFrameCenter = new Vector3();
const projectedFramePoint = new Vector3();
const projectedFrameCorners = Array.from({ length: 8 }, () => new Vector3());
const projectedDisplayBox = new Box3();
const projectedDisplayCenter = new Vector3();
const projectedDisplayPoint = new Vector3();
const projectedDisplayCorners = Array.from({ length: 8 }, () => new Vector3());

function getRenderPixelRatio(profile: RendererQualityProfile): number {
  return Math.min(window.devicePixelRatio || 1, profile.maxPixelRatio);
}

function hidePhoneHotspotButton(button: HTMLButtonElement | null) {
  if (!button) { return; }

  button.style.opacity = '0';
  button.style.pointerEvents = 'none';
}

function hideFrameHotspotButton(button: HTMLElement | null) {
  if (!button) { return; }

  button.style.opacity = '0';
  button.style.pointerEvents = 'none';
}

function consumeHotspotPointerEvent(
  event: ReactMouseEvent<HTMLButtonElement> | ReactPointerEvent<HTMLButtonElement>
) {
  event.preventDefault();
  event.stopPropagation();
}

function updatePhoneHotspotButton(
  scene: Scene,
  camera: PerspectiveCamera,
  button: HTMLButtonElement | null,
  visible: boolean
) {
  if (!button || !visible) {
    hidePhoneHotspotButton(button);
    return;
  }

  const phoneZone = getPhoneProjectionObject(scene);
  if (!phoneZone) {
    hidePhoneHotspotButton(button);
    return;
  }

  projectedPhoneBox.setFromObject(phoneZone);
  projectedPhoneBox.getCenter(projectedPhoneCenter);
  projectedPhonePoint.copy(projectedPhoneCenter).project(camera);

  if (projectedPhonePoint.z < -1 || projectedPhonePoint.z > 1) {
    hidePhoneHotspotButton(button);
    return;
  }

  const { min, max } = projectedPhoneBox;
  const corners = projectedPhoneCorners;

  corners[0].set(min.x, min.y, min.z);
  corners[1].set(max.x, min.y, min.z);
  corners[2].set(min.x, max.y, min.z);
  corners[3].set(max.x, max.y, min.z);
  corners[4].set(min.x, min.y, max.z);
  corners[5].set(max.x, min.y, max.z);
  corners[6].set(min.x, max.y, max.z);
  corners[7].set(max.x, max.y, max.z);

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const corner of corners) {
    projectedPhonePoint.copy(corner).project(camera);

    const screenX = (projectedPhonePoint.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (-projectedPhonePoint.y * 0.5 + 0.5) * window.innerHeight;

    minX = Math.min(minX, screenX);
    minY = Math.min(minY, screenY);
    maxX = Math.max(maxX, screenX);
    maxY = Math.max(maxY, screenY);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    hidePhoneHotspotButton(button);
    return;
  }

  const padding = 8;
  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const width = Math.max(48, (maxX - minX) + padding * 2);
  const height = Math.max(76, (maxY - minY) + padding * 2);

  button.style.left = `${left}px`;
  button.style.top = `${top}px`;
  button.style.width = `${width}px`;
  button.style.height = `${height}px`;
  button.style.opacity = '1';
  button.style.pointerEvents = 'auto';
}

function updateFrameHotspotButton(
  scene: Scene,
  camera: PerspectiveCamera,
  button: HTMLElement | null,
  visible: boolean
) {
  if (!button || !visible) {
    hideFrameHotspotButton(button);
    return;
  }

  const frameZone = getFrameProjectionObject(scene);
  if (!frameZone) {
    hideFrameHotspotButton(button);
    return;
  }

  projectedFrameBox.setFromObject(frameZone);
  projectedFrameBox.getCenter(projectedFrameCenter);
  projectedFramePoint.copy(projectedFrameCenter).project(camera);

  if (projectedFramePoint.z < -1 || projectedFramePoint.z > 1) {
    hideFrameHotspotButton(button);
    return;
  }

  const { min, max } = projectedFrameBox;
  const corners = projectedFrameCorners;

  corners[0].set(min.x, min.y, min.z);
  corners[1].set(max.x, min.y, min.z);
  corners[2].set(min.x, max.y, min.z);
  corners[3].set(max.x, max.y, min.z);
  corners[4].set(min.x, min.y, max.z);
  corners[5].set(max.x, min.y, max.z);
  corners[6].set(min.x, max.y, max.z);
  corners[7].set(max.x, max.y, max.z);

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const corner of corners) {
    projectedFramePoint.copy(corner).project(camera);

    const screenX = (projectedFramePoint.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (-projectedFramePoint.y * 0.5 + 0.5) * window.innerHeight;

    minX = Math.min(minX, screenX);
    minY = Math.min(minY, screenY);
    maxX = Math.max(maxX, screenX);
    maxY = Math.max(maxY, screenY);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    hideFrameHotspotButton(button);
    return;
  }

  const padding = 6;
  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const width = Math.max(34, (maxX - minX) + padding * 2);
  const height = Math.max(48, (maxY - minY) + padding * 2);

  button.style.left = `${left}px`;
  button.style.top = `${top}px`;
  button.style.width = `${width}px`;
  button.style.height = `${height}px`;
  button.style.opacity = '1';
  button.style.pointerEvents = 'auto';
}

function handleDesktopRequestsClosure(cameraHandler: CameraHandler) {
  return function(event: MessageEvent) {
    const request = parseRequestFromChild(event);
    if (!request.ok) { return; }
    const value = request.value;

    const context = cameraHandler.getContext();
    const controller = context.cameraController;

    switch (value.method) {
      case 'set_possible_camera_parameters_request': {

        const minZoom = controller.getMinZoom();
        const maxZoom = controller.getMaxZoom();
        const distance = value.currentZoom;

        const distanceDelta = distance - minZoom;
        const zoomDelta = maxZoom - minZoom;

        const zoomInPercentage = distanceDelta / zoomDelta;

        // TODO: Implement zoom in percentage view
      } break;
      case 'camera_zoom_distance_request': {

        const minZoom = controller.getMinZoom();
        const maxZoom = controller.getMaxZoom();
        const currentZoom = controller.getZoom();

        sendMessageToChild(event.source as Window, {
          method: 'camera_zoom_distance_response',
          max_distance: maxZoom,
          min_distance: minZoom,
          current_distance: currentZoom,
          max_horizontal_offset: 10,
          horizontal_offset: 0,
          max_vertical_offset: 10,
          vertical_offset: 0
        });

      } break;
      case 'set_camera_parameters_request': {
        const distance = value.currentZoom;

        controller.setZoom(distance);
        controller.setPanOffsetX(value.horizontalOffset);
        controller.setPanOffsetY(value.verticalOffset);

      } break;
      case 'mounted': {
        // Share the window size with the iframe, so we can see if it is a mobile device or not
        sendMessageToChild(event.source as Window, {
          method: 'display_size',
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    }
  }
}


export const Renderer = (props: RendererProps) => {
  const [cameraHandlerState, setCameraHandlerState] = useState<CameraHandlerState>(CameraHandlerState.Cinematic);
  const [phoneOverlayOpen, setPhoneOverlayOpen] = useState(false);
  const [immersivePhoneMode, setImmersivePhoneMode] = useState(false);
  const [desktopOverlayUrl, setDesktopOverlayUrl] = useState<string | null>(null);
  const [desktopOverlayRect, setDesktopOverlayRect] = useState<DesktopOverlayRect | null>(null);
  const [desktopOverlayVisible, setDesktopOverlayVisible] = useState(false);
  const [desktopOverlayLoaded, setDesktopOverlayLoaded] = useState(false);
  const [desktopOverlayExiting, setDesktopOverlayExiting] = useState(false);
  const [desktopOverlayExitStage, setDesktopOverlayExitStage] = useState<DesktopExitStage>(null);
  const [desktopOverlayInstance, setDesktopOverlayInstance] = useState(0);
  const soundService = useRef(new SoundService());

  const { loading, showMessage, scenes, actions } = props;

  const cssOutputRef: RefObject<HTMLDivElement | null> = useRef(null);
  const webglOutputRef: RefObject<HTMLDivElement | null> = useRef(null);
  const phoneHotspotButtonRef = useRef<HTMLButtonElement | null>(null);
  const frameHotspotButtonRef = useRef<HTMLAnchorElement | null>(null);
  const frameHotspotCleanupRef = useRef<(() => void) | null>(null);
  const desktopOverlayCloseTimeout = useRef<number | null>(null);
  const desktopOverlayLoadTimeout = useRef<number | null>(null);
  const desktopOverlayExitTimeout = useRef<number | null>(null);
  const desktopOverlayZoomOutTimeout = useRef<number | null>(null);
  const desktopOverlayFrameRef = useRef<HTMLIFrameElement | null>(null);
  const phoneOverlayOpenTimeoutRef = useRef<number | null>(null);
  const desktopOverlayUrlRef = useRef<string | null>(null);
  const desktopOverlayVisibleRef = useRef(false);
  const desktopOverlayLoadedRef = useRef(false);
  const desktopOverlayExitingRef = useRef(false);
  const desktopOverlayOpenedAtRef = useRef<number | null>(null);
  const desktopOverlayExitInFlightRef = useRef(false);
  const activeSceneRef = useRef<Scene | null>(null);
  const activeCameraRef = useRef<PerspectiveCamera | null>(null);
  const actionsRef = useRef<UpdateAction[]>(actions);

  const cameraHandlerRef = useRef<CameraHandler | null>(null);
  const cameraHandlerStateRef = useRef<CameraHandlerState>(CameraHandlerState.Cinematic);
  const previousCameraStateRef = useRef<CameraHandlerState>(CameraHandlerState.Cinematic);
  const phoneOverlayReturnStateRef = useRef<CameraHandlerState>(CameraHandlerState.Cinematic);
  const phoneOverlayOpenRef = useRef(false);
  const immersivePhoneModeRef = useRef(false);
  const desktopOverlayManagedExitRef = useRef(false);

  const allowUserInput = useRef<boolean>(!loading);

  const touchEvents = createUIEventBus();

  const mouseProgressCircle = HandleMouseInteractionInformation(touchEvents);
  const touchProgressCircle = HandleTouchProgressCircle(touchEvents);

  let then: RefObject<number | null> = useRef(null);

  function bindFrameHotspotLink(node: HTMLAnchorElement | null) {
    frameHotspotCleanupRef.current?.();
    frameHotspotCleanupRef.current = null;
    frameHotspotButtonRef.current = node;

    if (!node) { return; }

    const handlePointerDown = (event: PointerEvent) => {
      event.stopPropagation();
      window.location.assign('https://hack.osdc.dev');
    };
    const stopPropagation = (event: Event) => {
      event.stopPropagation();
    };

    node.addEventListener('pointerdown', handlePointerDown);
    node.addEventListener('pointerup', stopPropagation);
    node.addEventListener('click', stopPropagation);

    frameHotspotCleanupRef.current = () => {
      node.removeEventListener('pointerdown', handlePointerDown);
      node.removeEventListener('pointerup', stopPropagation);
      node.removeEventListener('click', stopPropagation);
    };
  }

  function getDesktopOverlayOriginRect(): DesktopOverlayRect | null {
    const scene = activeSceneRef.current;
    const camera = activeCameraRef.current;
    const display = scene?.getObjectByName(DisplayName);
    if (scene && camera && display) {
      projectedDisplayBox.setFromObject(display);
      projectedDisplayBox.getCenter(projectedDisplayCenter);
      projectedDisplayPoint.copy(projectedDisplayCenter).project(camera);

      if (projectedDisplayPoint.z >= -1 && projectedDisplayPoint.z <= 1) {
        const { min, max } = projectedDisplayBox;
        const corners = projectedDisplayCorners;

        corners[0].set(min.x, min.y, min.z);
        corners[1].set(max.x, min.y, min.z);
        corners[2].set(min.x, max.y, min.z);
        corners[3].set(max.x, max.y, min.z);
        corners[4].set(min.x, min.y, max.z);
        corners[5].set(max.x, min.y, max.z);
        corners[6].set(min.x, max.y, max.z);
        corners[7].set(max.x, max.y, max.z);

        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        for (const corner of corners) {
          projectedDisplayPoint.copy(corner).project(camera);

          const screenX = (projectedDisplayPoint.x * 0.5 + 0.5) * window.innerWidth;
          const screenY = (-projectedDisplayPoint.y * 0.5 + 0.5) * window.innerHeight;

          minX = Math.min(minX, screenX);
          minY = Math.min(minY, screenY);
          maxX = Math.max(maxX, screenX);
          maxY = Math.max(maxY, screenY);
        }

        if (Number.isFinite(minX) && Number.isFinite(minY) && Number.isFinite(maxX) && Number.isFinite(maxY)) {
          const padding = 12;

          return {
            left: Math.max(0, minX - padding),
            top: Math.max(0, minY - padding),
            width: Math.max(96, (maxX - minX) + padding * 2),
            height: Math.max(72, (maxY - minY) + padding * 2),
          };
        }
      }
    }

    const iframe = document.getElementById('operating-system-iframe') as HTMLIFrameElement | null;
    if (!iframe) { return null; }

    const rect = iframe.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) { return null; }

    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  function openDesktopOverlay(url: string) {
    const rect = getDesktopOverlayOriginRect();
    if (rect === null) { return; }

    if (desktopOverlayCloseTimeout.current !== null) {
      window.clearTimeout(desktopOverlayCloseTimeout.current);
      desktopOverlayCloseTimeout.current = null;
    }

    if (desktopOverlayExitTimeout.current !== null) {
      window.clearTimeout(desktopOverlayExitTimeout.current);
      desktopOverlayExitTimeout.current = null;
    }

    if (desktopOverlayZoomOutTimeout.current !== null) {
      window.clearTimeout(desktopOverlayZoomOutTimeout.current);
      desktopOverlayZoomOutTimeout.current = null;
    }

    setDesktopOverlayLoaded(false);
    setDesktopOverlayExiting(false);
    setDesktopOverlayExitStage(null);
    setDesktopOverlayRect(rect);
    setDesktopOverlayInstance((current) => current + 1);
    setDesktopOverlayUrl(url);
    setDesktopOverlayVisible(false);
    sendMessageToIframe({ method: 'deactivate_monitor_message' });
    desktopOverlayOpenedAtRef.current = performance.now();
    desktopOverlayExitInFlightRef.current = false;
    desktopOverlayManagedExitRef.current = false;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setDesktopOverlayVisible(true);
      });
    });
  }

  function closeDesktopOverlay(options?: { preserveExitScreen?: boolean }) {
    const preserveExitScreen = options?.preserveExitScreen ?? false;

    if (desktopOverlayUrlRef.current === null) { return; }

    setDesktopOverlayVisible(false);
    sendMessageToIframe({ method: 'deactivate_monitor_message' });

    if (!preserveExitScreen) {
      setDesktopOverlayExiting(false);
      setDesktopOverlayExitStage(null);
      desktopOverlayExitInFlightRef.current = false;
      desktopOverlayManagedExitRef.current = false;
    }

    if (desktopOverlayCloseTimeout.current !== null) {
      window.clearTimeout(desktopOverlayCloseTimeout.current);
    }

    if (desktopOverlayLoadTimeout.current !== null) {
      window.clearTimeout(desktopOverlayLoadTimeout.current);
      desktopOverlayLoadTimeout.current = null;
    }

    desktopOverlayCloseTimeout.current = window.setTimeout(() => {
      setDesktopOverlayUrl(null);
      setDesktopOverlayLoaded(false);
      setDesktopOverlayExiting(false);
      setDesktopOverlayExitStage(null);
      setDesktopOverlayRect(null);
      desktopOverlayOpenedAtRef.current = null;
      desktopOverlayExitInFlightRef.current = false;
      desktopOverlayManagedExitRef.current = false;
      desktopOverlayCloseTimeout.current = null;
    }, DesktopOverlayTransitionMs);
  }

  function beginDesktopExitSequence() {
    if (desktopOverlayUrlRef.current === null) { return; }
    if (desktopOverlayExitInFlightRef.current) { return; }

    desktopOverlayExitInFlightRef.current = true;
    desktopOverlayManagedExitRef.current = true;
    setDesktopOverlayExiting(true);
    setDesktopOverlayExitStage('message');
    sendMessageToIframe({ method: 'exit_desktop_message' });

    if (desktopOverlayExitTimeout.current !== null) {
      window.clearTimeout(desktopOverlayExitTimeout.current);
    }

    if (desktopOverlayZoomOutTimeout.current !== null) {
      window.clearTimeout(desktopOverlayZoomOutTimeout.current);
    }

    desktopOverlayExitTimeout.current = window.setTimeout(() => {
      closeDesktopOverlay({ preserveExitScreen: true });
      desktopOverlayExitTimeout.current = null;

      desktopOverlayZoomOutTimeout.current = window.setTimeout(() => {
        cameraHandlerRef.current?.changeState(CameraHandlerState.Cinematic);
        desktopOverlayZoomOutTimeout.current = null;
      }, DesktopOverlayExitZoomDelayMs);
    }, DesktopOverlayExitMessageMs);
  }

  function closePhoneOverlay() {
    if (phoneOverlayOpenTimeoutRef.current !== null) {
      window.clearTimeout(phoneOverlayOpenTimeoutRef.current);
      phoneOverlayOpenTimeoutRef.current = null;
    }

    setPhoneOverlayOpen(false);

    const returnState = phoneOverlayReturnStateRef.current === CameraHandlerState.PhoneView
      ? CameraHandlerState.FreeRoam
      : phoneOverlayReturnStateRef.current;

    phoneOverlayReturnStateRef.current = CameraHandlerState.FreeRoam;

    if (immersivePhoneModeRef.current) {
      setImmersivePhoneMode(false);
      immersivePhoneModeRef.current = false;

      const context = cameraHandlerRef.current?.getContext();
      if (context) {
        setInitialCameraPosition(context.cameraController, getDisplay(context.scene));
      }

      window.requestAnimationFrame(() => {
        cameraHandlerRef.current?.changeState(CameraHandlerState.FreeRoam);
      });

      return;
    }

    cameraHandlerRef.current?.changeState(returnState ?? CameraHandlerState.FreeRoam);
  }

  function openPhoneOverlayFromDesk() {
    if (phoneOverlayOpenTimeoutRef.current !== null) {
      window.clearTimeout(phoneOverlayOpenTimeoutRef.current);
      phoneOverlayOpenTimeoutRef.current = null;
    }

    phoneOverlayReturnStateRef.current = CameraHandlerState.FreeRoam;
    setPhoneOverlayOpen(true);
  }

  function shouldUsePhoneOverlayFallback(): boolean {
    return immersivePhoneModeRef.current || Boolean(activeSceneRef.current?.userData[PhoneOverlayFallbackUserDataKey]);
  }

  function handleCameraHandlerStateChange(state: CameraHandlerState): void {
    const previousState = previousCameraStateRef.current;
    previousCameraStateRef.current = state;
    cameraHandlerStateRef.current = state;
    setCameraHandlerState(state);

    if (state === CameraHandlerState.MonitorView) {
      sendMessageToIframe({ method: 'activate_monitor_message' });
    }

    if (state === CameraHandlerState.PhoneView) {
      if (!shouldUsePhoneOverlayFallback()) {
        const activatePhoneIframe = activeSceneRef.current?.userData[ActivatePhoneIframeUserDataKey];
        if (typeof activatePhoneIframe === 'function') {
          activatePhoneIframe();
        }
      }

      phoneOverlayReturnStateRef.current = previousState === CameraHandlerState.PhoneView
        ? CameraHandlerState.FreeRoam
        : previousState;
      setPhoneOverlayOpen(false);

      if (phoneOverlayOpenTimeoutRef.current !== null) {
        window.clearTimeout(phoneOverlayOpenTimeoutRef.current);
      }

      if (shouldUsePhoneOverlayFallback()) {
        phoneOverlayOpenTimeoutRef.current = window.setTimeout(() => {
          if (
            cameraHandlerStateRef.current === CameraHandlerState.PhoneView &&
            shouldUsePhoneOverlayFallback()
          ) {
            setPhoneOverlayOpen(true);
          }
          phoneOverlayOpenTimeoutRef.current = null;
        }, PhoneOverlayOpenDelayMs);
      }
    }

    if (previousState === CameraHandlerState.PhoneView && state !== CameraHandlerState.PhoneView) {
      if (phoneOverlayOpenTimeoutRef.current !== null) {
        window.clearTimeout(phoneOverlayOpenTimeoutRef.current);
        phoneOverlayOpenTimeoutRef.current = null;
      }
      setPhoneOverlayOpen(false);
    }

    if (previousState === CameraHandlerState.MonitorView && state !== CameraHandlerState.MonitorView) {
      sendMessageToIframe({ method: 'deactivate_monitor_message' });

      if (desktopOverlayManagedExitRef.current) {
        desktopOverlayManagedExitRef.current = false;
        return;
      }

      if (!desktopOverlayExitInFlightRef.current) {
        sendMessageToIframe({ method: 'exit_desktop_message' });
        closeDesktopOverlay();
      }
    }
  }

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    const cssRenderNode = cssOutputRef.current;
    const webglRenderNode = webglOutputRef.current;

    const debug = isDebug();
    const quality = RendererQualityProfiles[getQualityLevel()];
    const perfNoGlobe = hasPerfFlag('perfNoGlobe');
    const perfNoGlobePreview = hasPerfFlag('perfNoGlobePreview');
    const perfNoPhoneIframe = hasPerfFlag('perfNoPhoneIframe');
    const perfNoMonitorIframe = hasPerfFlag('perfNoMonitorIframe');
    const perfNoPortal = hasPerfFlag('perfNoPortal');
    
    if (cssRenderNode == null || webglRenderNode == null) { return; }

    let animationFrameId: number | null = null;

    const stats = new Stats();
    const [width, height] = getBrowserDimensions();

    const [scene, cutoutScene, cssScene] = [scenes.sourceScene, scenes.cutoutScene, scenes.cssScene];
    const camera = createCamera(75, calculateAspectRatio(width, height));
    const [renderer, cssRenderer] = createRenderers(width, height, quality);

    disableTouchInteraction(cssRenderNode);
    disableTouchInteraction(webglRenderNode);

    const cameraController  = new CameraController(camera, scene, cutoutScene);
    const cameraHandler     = new CameraHandler(
      cameraController,
      webglRenderNode,
      touchEvents,
      handleCameraHandlerStateChange,
    );
    const mouseInputHandler = new MouseInputHandler(allowUserInput, cameraHandler);
    const touchInputHandler = new TouchInputHandler(allowUserInput, cameraHandler);

    cameraHandlerRef.current = cameraHandler;
    activeSceneRef.current = scene;
    activeCameraRef.current = camera;
    scene.userData[OpenPhoneOverlayUserDataKey] = () => {
      openPhoneOverlayFromDesk();
    };

    const handleDesktopEvent = handleDesktopRequestsClosure(cameraHandler);

    const composer = createComposer(renderer, width, height, quality);

    const cutoutShaderPass = new CutOutRenderShaderPass(scene, cutoutScene, camera, width, height);
    composer.addPass(cutoutShaderPass);

    const saoPass = quality.enableSao ? new SAOPass(scene, camera) : null;
    if (saoPass) {
      saoPass.resolution.set(96, 96);
      saoPass.params.saoBias = 100;
      saoPass.params.saoIntensity = 0.0003;
      saoPass.params.saoBlur = false;
      composer.addPass(saoPass);
    }

    const fxaaPass = new FXAAShaderPass(width, height);
    composer.addPass(fxaaPass);

    cssRenderNode.appendChild(cssRenderer.domElement);
    webglRenderNode.appendChild(renderer.domElement);

    if (debug) {
      webglRenderNode.appendChild(stats.dom);
      console.info(
        '[Renderer] quality=%s maxPixelRatio=%d sao=%s perfNoGlobe=%s perfNoGlobePreview=%s perfNoPhoneIframe=%s perfNoMonitorIframe=%s perfNoPortal=%s',
        quality.level,
        quality.maxPixelRatio,
        quality.enableSao ? 'on' : 'off',
        perfNoGlobe ? 'on' : 'off',
        perfNoGlobePreview ? 'on' : 'off',
        perfNoPhoneIframe ? 'on' : 'off',
        perfNoMonitorIframe ? 'on' : 'off',
        perfNoPortal ? 'on' : 'off',
      );
    }

    let frameAccumulator = 0;
    let frameCount = 0;
    let statsAccumulator = 0;
    let lastRenderedAt = 0;
    let parentRenderMode: 'normal' | 'throttled' = 'normal';

    const flushDebugStats = () => {
      if (!debug || statsAccumulator < 3) {
        return;
      }

      const fps = frameAccumulator > 0 ? frameCount / frameAccumulator : 0;
      console.info(
        '[Renderer] fps=%d pixelRatio=%d composerCalls=%d composerTriangles=%d geometries=%d textures=%d quality=%s parentRenderMode=%s perfNoGlobe=%s perfNoGlobePreview=%s perfNoPhoneIframe=%s perfNoMonitorIframe=%s perfNoPortal=%s',
        Math.round(fps),
        renderer.getPixelRatio(),
        renderer.info.render.calls,
        renderer.info.render.triangles,
        renderer.info.memory.geometries,
        renderer.info.memory.textures,
        quality.level,
        parentRenderMode,
        perfNoGlobe ? 'on' : 'off',
        perfNoGlobePreview ? 'on' : 'off',
        perfNoPhoneIframe ? 'on' : 'off',
        perfNoMonitorIframe ? 'on' : 'off',
        perfNoPortal ? 'on' : 'off',
      );
      frameAccumulator = 0;
      frameCount = 0;
      statsAccumulator = 0;
    };
    
    const animate = function(now: number) {
      if (then.current == null) { then.current = now; }
      const deltaTime = (now - then.current) * 0.001; // Get delta time in seconds
      then.current = now;

      animationFrameId = requestAnimationFrame(animate);
      frameAccumulator += deltaTime;
      frameCount += 1;
      statsAccumulator += deltaTime;

      const desktopOverlayCoversScene =
        desktopOverlayUrlRef.current !== null &&
        desktopOverlayVisibleRef.current &&
        desktopOverlayLoadedRef.current &&
        !desktopOverlayExitingRef.current;

      parentRenderMode = desktopOverlayCoversScene ? 'throttled' : 'normal';
      const shouldRenderFrame =
        !desktopOverlayCoversScene ||
        lastRenderedAt === 0 ||
        now - lastRenderedAt >= ThrottledParentRenderIntervalMs;

      if (!shouldRenderFrame) {
        flushDebugStats();
        return;
      }

      lastRenderedAt = now;

      if (debug) { stats.begin(); }

      for (const action of actionsRef.current) {
        action(deltaTime);
      }

      cameraController.update(deltaTime);
      cameraHandler.update(deltaTime);

      updatePhoneHotspotButton(
        scene,
        camera,
        phoneHotspotButtonRef.current,
        !immersivePhoneModeRef.current &&
        cameraHandlerStateRef.current !== CameraHandlerState.MonitorView &&
        cameraHandlerStateRef.current !== CameraHandlerState.PhoneView &&
        desktopOverlayUrlRef.current === null &&
        !phoneOverlayOpenRef.current
      );

      updateFrameHotspotButton(
        scene,
        camera,
        frameHotspotButtonRef.current,
        cameraHandlerStateRef.current !== CameraHandlerState.MonitorView &&
        cameraHandlerStateRef.current !== CameraHandlerState.PhoneView &&
        desktopOverlayUrlRef.current === null &&
        !phoneOverlayOpenRef.current
      );

      renderWebglContext(composer);
      renderCssContext(cssScene, cssRenderer, camera);

      flushDebugStats();

      if (debug) { stats.end(); }
    }
    
    const onWindowResize = function() {
      const [width, height] = getBrowserDimensions();

      resizeRenderers(composer, renderer, cssRenderer, width, height, quality);
      resizeCamera(camera, calculateAspectRatio(width, height));
      setImmersivePhoneMode(width <= 700);

      sendMessageToIframe({
        method: 'display_size',
        width: window.innerWidth,
        height: window.innerHeight,
      });

      if (desktopOverlayUrlRef.current && !desktopOverlayVisibleRef.current) {
        setDesktopOverlayRect(getDesktopOverlayOriginRect());
      }
    }

    const onWindowMessage = function(event: MessageEvent) {
      if (
        event.origin === window.location.origin &&
        event.data &&
        event.data.method === 'return_to_desk_message'
      ) {
        setPhoneOverlayOpen(false);
        phoneOverlayReturnStateRef.current = CameraHandlerState.FreeRoam;

        const context = cameraHandlerRef.current?.getContext();
        if (context) {
          setInitialCameraPosition(context.cameraController, getDisplay(context.scene));
        }

        window.requestAnimationFrame(() => {
          cameraHandlerRef.current?.changeState(CameraHandlerState.FreeRoam);
        });
        return;
      }

      if (
        event.data &&
        event.data.type === 'osdc-open-desktop-overlay' &&
        typeof event.data.desktopUrl === 'string'
      ) {
        if (cameraHandlerStateRef.current !== CameraHandlerState.MonitorView) {
          cameraHandlerRef.current?.changeState(CameraHandlerState.MonitorView);
          return;
        }

        openDesktopOverlay(event.data.desktopUrl);
        return;
      }

      if (event.data && event.data.type === 'osdc-close-desktop-overlay') {
        beginDesktopExitSequence();
        return;
      }

      handleDesktopEvent(event);
    };

    const onDestroy = function() {
      if (animationFrameId) { cancelAnimationFrame(animationFrameId); }

      enableTouchInteraction(cssRenderNode);
      enableTouchInteraction(webglRenderNode);

      renderer.dispose();
      renderer.forceContextLoss();

      mouseInputHandler.destroy();
      touchInputHandler.destroy();

      cameraHandler.destroy();
      scene.userData[OpenPhoneOverlayUserDataKey] = undefined;
      activeSceneRef.current = null;
      activeCameraRef.current = null;

      cssRenderNode.removeChild(cssRenderer.domElement);
      webglRenderNode.removeChild(renderer.domElement);

      window.removeEventListener('resize', onWindowResize, false);
      window.removeEventListener('message', onWindowMessage, false);
    }

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('message', onWindowMessage, false);

    animate(performance.now());

    return () => onDestroy();
  }, []);

  useEffect(() => {
    const syncImmersivePhoneMode = () => {
      setImmersivePhoneMode(window.innerWidth <= 700);
    };

    syncImmersivePhoneMode();

    window.addEventListener('resize', syncImmersivePhoneMode);

    return () => {
      window.removeEventListener('resize', syncImmersivePhoneMode);
    };
  }, []);

  useEffect(() => {
    if (loading) { return; }

    const context = cameraHandlerRef.current?.getContext();
    if (!context) { return; }

    setInitialCameraPosition(context.cameraController, getDisplay(context.scene));
    allowUserInput.current = true;

    const frame = window.requestAnimationFrame(() => {
      cameraHandlerRef.current?.changeState(CameraHandlerState.FreeRoam);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [loading]);

  useEffect(() => {
    immersivePhoneModeRef.current = immersivePhoneMode;
  }, [immersivePhoneMode]);

  useEffect(() => {
    if (!desktopOverlayUrl || !desktopOverlayVisible) { return; }

    sendMessageToChild(desktopOverlayFrameRef.current?.contentWindow ?? null, {
      method: 'display_size',
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, [desktopOverlayUrl, desktopOverlayVisible]);

  useEffect(() => {
    if (!desktopOverlayUrl) { return; }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        beginDesktopExitSequence();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [desktopOverlayUrl]);

  useEffect(() => {
    desktopOverlayUrlRef.current = desktopOverlayUrl;
  }, [desktopOverlayUrl]);

  useEffect(() => {
    desktopOverlayVisibleRef.current = desktopOverlayVisible;
  }, [desktopOverlayVisible]);

  useEffect(() => {
    desktopOverlayLoadedRef.current = desktopOverlayLoaded;
  }, [desktopOverlayLoaded]);

  useEffect(() => {
    desktopOverlayExitingRef.current = desktopOverlayExiting;
  }, [desktopOverlayExiting]);

  useEffect(() => {
    phoneOverlayOpenRef.current = phoneOverlayOpen;
  }, [phoneOverlayOpen]);

  useEffect(() => {
    return () => {
      if (desktopOverlayCloseTimeout.current !== null) {
        window.clearTimeout(desktopOverlayCloseTimeout.current);
      }

      if (desktopOverlayLoadTimeout.current !== null) {
        window.clearTimeout(desktopOverlayLoadTimeout.current);
      }

      if (phoneOverlayOpenTimeoutRef.current !== null) {
        window.clearTimeout(phoneOverlayOpenTimeoutRef.current);
      }

      if (desktopOverlayExitTimeout.current !== null) {
        window.clearTimeout(desktopOverlayExitTimeout.current);
      }

      if (desktopOverlayZoomOutTimeout.current !== null) {
        window.clearTimeout(desktopOverlayZoomOutTimeout.current);
      }
    }
  }, []);

  const desktopOverlayFrameStyle = desktopOverlayVisible || desktopOverlayRect === null
    ? {
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        opacity: 1,
      }
    : {
        top: desktopOverlayRect.top,
        left: desktopOverlayRect.left,
        width: desktopOverlayRect.width,
        height: desktopOverlayRect.height,
        borderRadius: 24,
        opacity: 1,
      };

  return (
    <div className={styles.renderer}>
      <div className={styles['css-output']} ref={cssOutputRef}></div>
      <div className={styles['webgl-output']} ref={webglOutputRef}></div>
      {desktopOverlayUrl && (
        <div
          className={[
            styles['desktop-overlay'],
            styles['desktop-overlay-active'],
            desktopOverlayVisible ? styles['desktop-overlay-open'] : '',
            desktopOverlayExiting ? styles['desktop-overlay-exiting'] : '',
            desktopOverlayExitStage === 'message' ? styles['desktop-overlay-exit-message'] : '',
            desktopOverlayLoaded ? styles['desktop-overlay-ready'] : '',
          ].join(' ')}
        >
          <div className={styles['desktop-overlay-frame']} style={desktopOverlayFrameStyle}>
            <iframe
              key={desktopOverlayInstance}
              ref={desktopOverlayFrameRef}
              id="operating-system-overlay-iframe"
              className={[
                styles['desktop-overlay-iframe'],
                desktopOverlayLoaded ? styles['desktop-overlay-iframe-ready'] : '',
              ].join(' ')}
              src={desktopOverlayUrl}
              title="OSDC Desktop"
              onLoad={() => {
                const openedAt = desktopOverlayOpenedAtRef.current ?? performance.now();
                const elapsed = performance.now() - openedAt;
                const remaining = Math.max(0, DesktopOverlayMinimumLoaderMs - elapsed);

                if (desktopOverlayLoadTimeout.current !== null) {
                  window.clearTimeout(desktopOverlayLoadTimeout.current);
                }

                desktopOverlayLoadTimeout.current = window.setTimeout(() => {
                  setDesktopOverlayLoaded(true);
                  desktopOverlayFrameRef.current?.focus();
                  desktopOverlayLoadTimeout.current = null;
                }, remaining);
              }}
            />
            <div
              className={[
                styles['desktop-overlay-loading'],
                desktopOverlayLoaded ? styles['desktop-overlay-loading-hidden'] : '',
              ].join(' ')}
            >
                <div className={styles['desktop-overlay-loader-panel']}>
                  <div className={styles['desktop-overlay-loader-header']}>
                    <div className={styles['desktop-overlay-loader-brand']}>
                      <div className={styles['desktop-overlay-loader-badge']}>OSDC</div>
                      <div>
                        <div className={styles['desktop-overlay-loader-title']}>Club Desktop</div>
                        <div className={styles['desktop-overlay-loader-subtitle']}>Launching monitor workspace</div>
                      </div>
                    </div>
                    <div className={styles['desktop-overlay-loader-revision']}>Build 1986.26</div>
                  </div>

                  <div className={styles['desktop-overlay-loader-body']}>
                    <div className={styles['desktop-overlay-loader-status']}>
                      Initializing window manager...
                      <br />
                      Mounting club filesystem...
                    </div>

                    <div className={styles['desktop-overlay-loader-progress-shell']}>
                      <div className={styles['desktop-overlay-loader-progress-track']}>
                        <div className={styles['desktop-overlay-loader-progress-fill']}></div>
                      </div>
                    </div>

                    <div className={styles['desktop-overlay-loader-footer']}>
                      <span>Open Source Developers Community</span>
                      <span>Please wait</span>
                    </div>
                  </div>
                </div>
              </div>
            {desktopOverlayExiting && (
              <div
                className={styles['desktop-overlay-exit-screen']}
              >
                <div className={styles['desktop-overlay-exit-panel']}>
                  <div className={styles['desktop-overlay-exit-title']}>Thank you for visiting</div>
                  <div className={styles['desktop-overlay-exit-copy']}>
                    Writing back the session...
                    <br />
                    Recalling the globe screensaver...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <button
        ref={phoneHotspotButtonRef}
        type="button"
        className={styles['phone-hotspot']}
        aria-label="Open OSDC Pocket"
        onPointerDown={consumeHotspotPointerEvent}
        onPointerUp={consumeHotspotPointerEvent}
        onClick={(event) => {
          consumeHotspotPointerEvent(event);
          openPhoneOverlayFromDesk();
        }}
      ></button>
      <a
        ref={bindFrameHotspotLink}
        className={`${styles['phone-hotspot']} ${styles['frame-hotspot']}`}
        aria-label="Open OSDHack"
        href="https://hack.osdc.dev"
      ></a>
      <PhoneOverlay open={phoneOverlayOpen} onClose={closePhoneOverlay} immersive={immersivePhoneMode} />
      {mouseProgressCircle}
      {touchProgressCircle}

      <BackgroundSounds cameraHandlerState={cameraHandlerState} soundService={soundService.current} />
    </div>
  );
};
