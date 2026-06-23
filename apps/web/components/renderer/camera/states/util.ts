import { Mesh, Object3D, Raycaster, Scene, Spherical, Vector2, Vector3 } from "three";
import { CameraHandlerContext } from "../CameraHandler";
import { MouseData, PointerCoordinates, TouchData } from "@/events/UserInteractionEvents";
import { CameraController } from "../Camera";
import { degToRad } from "three/src/math/MathUtils";
import { calculateAspectRatio } from "../../util";
import { DisplayName, DisplayParentName, PhoneInteractionZoneName, PhotoFrameInteractionZoneName } from "@/components/scene-loader/AssetLoaders";

export type SceneInteractionTarget = 'display' | 'phone' | 'frame' | null;

const PhoneInteractionProjectionNames = [PhoneInteractionZoneName];
const PhoneInteractionNames = [PhoneInteractionZoneName];
const FrameInteractionNames = ['thethingportal', 'portal', 'Sketchfab_model.005', PhotoFrameInteractionZoneName];

function getFirstNamedObject(scene: Scene, names: string[]): Object3D | null {
  for (const name of names) {
    const object = scene.getObjectByName(name);

    if (object) {
      return object;
    }
  }

  return null;
}

export const getPhoneInteractionZone = (scene: Scene): Object3D | null => {
  return getFirstNamedObject(scene, PhoneInteractionNames);
}

export const getPhoneProjectionObject = (scene: Scene): Object3D | null => {
  return getFirstNamedObject(scene, PhoneInteractionProjectionNames);
}

export const getFrameInteractionZone = (scene: Scene): Object3D | null => {
  return getFirstNamedObject(scene, FrameInteractionNames);
}

export const getFrameProjectionObject = (scene: Scene): Object3D | null => {
  return getFirstNamedObject(scene, FrameInteractionNames);
}

export const constructGetInteractionTarget = (ctx: CameraHandlerContext): ((data: PointerCoordinates) => SceneInteractionTarget) => {
  const cutoutRaycaster = new Raycaster();
  const sceneRaycaster = new Raycaster();
  const point = new Vector2();

  return (data: PointerCoordinates) => {
    point.x = (data.x / window.innerWidth) * 2 - 1;
    point.y = -(data.y / window.innerHeight) * 2 + 1;

    const camera = ctx.cameraController.getCamera();

    cutoutRaycaster.setFromCamera(point, camera);

    const displayIntersects = cutoutRaycaster.intersectObjects(ctx.cameraController.getCutoutScene().children);
    const firstDisplay = displayIntersects[0]?.object.name === DisplayName ? displayIntersects[0] : null;

    const phoneInteractionZone = getPhoneInteractionZone(ctx.scene);
    const firstPhone = (() => {
      if (!phoneInteractionZone) { return null; }

      sceneRaycaster.setFromCamera(point, camera);

      const phoneIntersects = sceneRaycaster.intersectObject(phoneInteractionZone, true);

      return phoneIntersects[0] ?? null;
    })();
    const frameInteractionZone = getFrameInteractionZone(ctx.scene);
    const firstFrame = (() => {
      if (!frameInteractionZone) { return null; }

      sceneRaycaster.setFromCamera(point, camera);

      const frameIntersects = sceneRaycaster.intersectObject(frameInteractionZone, true);

      return frameIntersects[0] ?? null;
    })();

    const nearestDistance = Math.min(
      firstDisplay?.distance ?? Number.POSITIVE_INFINITY,
      firstPhone?.distance ?? Number.POSITIVE_INFINITY,
      firstFrame?.distance ?? Number.POSITIVE_INFINITY
    );

    if (firstFrame && firstFrame.distance === nearestDistance) {
      return 'frame';
    }

    if (firstPhone && firstPhone.distance === nearestDistance) {
      return 'phone';
    }

    if (firstDisplay) {
      return 'display';
    }

    return null;
  }
}

export const constructIsOverDisplay = (ctx: CameraHandlerContext): ((data: PointerCoordinates) => boolean) => {
  const getInteractionTarget = constructGetInteractionTarget(ctx);

  return (data: PointerCoordinates) => getInteractionTarget(data) === 'display';
}

export const constructIsOverPhone = (ctx: CameraHandlerContext): ((data: PointerCoordinates) => boolean) => {
  const getInteractionTarget = constructGetInteractionTarget(ctx);

  return (data: PointerCoordinates) => getInteractionTarget(data) === 'phone';
}

export function openPhotoFrameDestination(): void {
  window.location.assign('https://hack.osdc.dev');
}

export function isMouseRotateCamera(data: MouseData): boolean {
  return data.isPrimaryDown();
}

export function isTouchTap(data: TouchData): boolean {
  return data.hasTouchesDown(1);
}

export function isTouchRotateCamera(data: TouchData): boolean {
  return data.hasTouchesDown(1);
}

export function isMouseMoveCamera(data: MouseData): boolean {
  return data.isSecondaryDown();
}

export function isTouchMoveCamera(data: TouchData): boolean {
  return data.hasTouchesDown(2) || data.hasTouchesDown(3);
}

export function isTouchZoom(data: TouchData): boolean {
  return data.hasTouchesDown(2);
}

export class PanOriginData {
  constructor(
    public touchData: TouchData,
    public zoomDistance: number
  ) {}

  static create(cameraController: CameraController, touchData: TouchData): PanOriginData {
    return new PanOriginData(touchData, cameraController.getZoom());
  }
}

export function isOwnOrigin(data: TouchData): boolean {
  return data.origin === 'self';
}

export function isRpcOrigin(data: TouchData): boolean {
  return data.origin === 'rpc';
}

export const getDisplay = (scene: Scene): Mesh | undefined => {
  // This makes it that there may only be one display on the scene.
  const parent = scene.children.find(x => x.name === DisplayParentName);
  const display = parent?.children.find(x => x.name === DisplayName) as Mesh | undefined;

  return display;
}

export const calculateCameraPosition = (display: Mesh, fov: number, zoomDistance: number) => {
  if (!display.geometry.boundingBox) {
    display.geometry.computeBoundingBox();
  }

  const bb = display.geometry.boundingBox;
  if (!bb) {
    throw new Error('Display bounding box could not be resolved');
  }

  const width   = bb.max.x - bb.min.x;
  const height  = bb.max.y - bb.min.y;
  const depth   = bb.max.z - bb.min.z;
  const centerPoint = new Vector3(
    bb.min.x + width / 2,
    bb.min.y + height / 2,
    bb.min.z + depth / 2
  );

  const position = display.localToWorld(centerPoint.clone());
  const spherical = new Spherical();

  if (Array.isArray(display.userData.cameraVector) && display.userData.cameraVector.length === 3) {
    const cameraVector = new Vector3(
      display.userData.cameraVector[0],
      display.userData.cameraVector[1],
      display.userData.cameraVector[2]
    ).normalize();

    spherical.setFromVector3(cameraVector);
  } else if (display.userData.useWorldNormalCamera) {
    const normal = new Vector3(0, 0, 1);
    const quaternion = display.getWorldQuaternion(display.quaternion.clone());

    normal.applyQuaternion(quaternion).normalize();
    spherical.setFromVector3(normal);
  } else {
    spherical.phi = Math.atan2(height, depth);
  }

  const rotation = new Vector3();
  rotation.setFromSpherical(spherical);
  // TODO: Calculate in rotation, prob from mesh self, as bounding box does not contain the information needed

  const fovAngle      = fov / 2;
  const oppositeAngle = Math.tan(degToRad(fovAngle));

  const [windowWidth, windowHeight] = [window.innerWidth, window.innerHeight];
  const aspectRatio = calculateAspectRatio(windowWidth, windowHeight);
  const zoom = zoomDistance / aspectRatio;

  const cameraZoomDistance = typeof display.userData.cameraZoomDistance === 'number'
    ? display.userData.cameraZoomDistance
    : zoomDistance;
  const distance = oppositeAngle * ((width / 2) + (cameraZoomDistance / aspectRatio));

  return {
    spherical,
    position,
    distance
  }
}

export function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function overDOMButton(x: number, y: number): boolean {
  const maxDepth = 5;

  let currentDepth = 0;
  let element: Element | null = document.elementFromPoint(x, y);

  do {
    if (!element) { return false; }
    if (element.tagName === 'BUTTON') { return true; }

    element = element.parentElement;

  } while (currentDepth++ < maxDepth);

  return false;
}

export function clickedDOMButton(isPrimaryDown: boolean, x: number, y: number): boolean {
  if (!isPrimaryDown) { return false; }

  return overDOMButton(x, y);
}

export function focusDesktop(): void {
  const iframe = document.getElementById('operating-system-iframe') as HTMLIFrameElement | null;
  iframe?.focus();
}

export function focusPhoneScreen(): void {
  const iframe = document.getElementById('phone-screen-iframe') as HTMLIFrameElement | null;
  iframe?.focus();
}

export function blurDesktop(): void {
  (document.activeElement as HTMLElement | null)?.blur();
}
