import { AmbientLight, AnimationClip, AnimationMixer, AxesHelper, BackSide, Box3, BoxGeometry, BufferGeometry, Color, DirectionalLight, DoubleSide, HemisphereLight, LoopPingPong, Material, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, PointLight, Quaternion, RepeatWrapping, Scene, SpotLight, Texture, Vector3 } from "three";
import { AssetLoader, AssetManagerContext, OptionalUpdateAction, UpdateAction } from "./AssetManager";
import { AssetKeys } from "./AssetKeys";
import { RendererScenes } from "../renderer/Renderer";
import { isSafari } from "../renderer/util";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import { degToRad } from "three/src/math/MathUtils";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { hasPerfFlag } from "./util";

export const DisplayParentName = "DisplayParent";
export const DisplayName = "Display";
export const PhoneInteractionZoneName = "PhoneInteractionZone";
export const PhoneOverlayFallbackUserDataKey = "phoneOverlayFallback";
export const PhotoFrameInteractionZoneName = "PhotoFrameInteractionZone";
export const SceneAssetRevision = "2026-06-22-prolly-optimized-asset-1";
const MonitorName = "Monitor";
const ComputerName = "Computer";
const DeskName = "Desk";
const NamePlateName = "NamePlate";
const FloorName = "Floor";
export const PhotoFrameObjectName = "Object_13";
const SharedDecorAssetName = '/assets/prolly-optimized.glb';
const DecorPhoneRootNames = ['Sketchfab_model003', 'Sketchfab_model.003'];
const DecorPortalRootNames = ['Sketchfab_model005', 'Sketchfab_model.005'];
const DecorPhoneBodyRootNames = ['Object_2002', 'Object_2.002'];
const PhoneScreenObjectNames = ['Object_8001', 'Object_8.001'];
const PhoneScreenFallbackObjectNames = ['Object_8'];
const PhoneScreenSurfaceName = 'PhoneScreenSurface';
const PhoneScreenCssName = 'PhoneScreenCss';
const PhoneScreenMatteName = 'PhoneScreenMatte';
const PhoneScreenGlowName = 'PhoneScreenGlow';
const PhoneDebugPlaneName = 'PhoneDebugPlane';
const PhoneDebugAxesName = 'PhoneDebugAxes';
export const ActivatePhoneIframeUserDataKey = 'activatePhoneIframe';
const PhoneScreenInsetX = 0.48;
const PhoneScreenInsetY = 0.48;
const PhoneScreenNormalOffset = 0.0025;
const PhoneCutoutNormalOffset = 0.003;
const PhoneHotspotNormalOffset = 0.006;
const PhoneScreenRotationOffset = 0;
const OfficeSceneScale = 1.52;
const OfficeScenePosition = {
  x: 0,
  y: 0,
  z: -4.1
};
export const OfficeSeatCameraTarget = {
  x: -0.72,
  y: 5.92,
  z: -3.78
};

export const OfficeDefaultCameraTarget = {
  x: -0.72,
  y: 5.92,
  z: -3.78
};

let sharedDecorAssetPromise: Promise<GLTF> | null = null;

async function loadTexture(context: AssetManagerContext, asset: string): Promise<Texture> {
  const texture = await context.textureLoader.loadAsync(asset);

  texture.flipY = false;

  return texture;
}

async function loadModel(context: AssetManagerContext, asset: string): Promise<GLTF> {
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

  if (context.debug) {
    console.info('[AssetLoaders] loading model', asset);
  }

  const gltf = await context.gltfLoader.loadAsync(asset);

  if (context.debug) {
    const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    console.info('[AssetLoaders] loaded model %s in %dms', asset, Math.round(finishedAt - startedAt));
  }

  return gltf;
}

function getSharedDecorAssetUrl(): string {
  return `${SharedDecorAssetName}?v=${encodeURIComponent(SceneAssetRevision)}`;
}

async function loadSharedDecorAsset(context: AssetManagerContext): Promise<GLTF> {
  if (!sharedDecorAssetPromise) {
    const assetUrl = getSharedDecorAssetUrl();

    console.info('[OfficeEnvironmentLoader] loading required scene:', assetUrl);

    sharedDecorAssetPromise = loadModel(context, assetUrl).catch((error) => {
      sharedDecorAssetPromise = null;
      console.error('[OfficeEnvironmentLoader] failed to load required prolly.glb', error);
      throw error;
    });
  }

  return await sharedDecorAssetPromise;
}

function createFallbackPhoneAsset(): Object3D {
  const root = new Object3D();
  const shell = new Mesh(
    new BoxGeometry(0.56, 0.06, 1.02),
    new MeshStandardMaterial({
      color: 0x141b24,
      metalness: 0.18,
      roughness: 0.64,
    })
  );
  const screen = new Mesh(
    new PlaneGeometry(0.48, 0.88),
    new MeshBasicMaterial({ color: 0x07111a, side: DoubleSide })
  );

  screen.name = PhoneScreenObjectNames[0];
  screen.position.y = 0.032;
  screen.rotation.x = -Math.PI / 2;

  root.add(shell);
  root.add(screen);

  return root;
}

function enableCameraCollision(asset: GLTF): void {
  for (const obj of asset.scene.children) {
    obj.userData[AssetKeys.CameraCollidable] = true;
  }
}

export function createRenderScenes(): RendererScenes {
  const sourceScene = new Scene();

  sourceScene.background = new Color(0x2f3540);

  return {
    sourceScene,
    cutoutScene: new Scene(),
    cssScene: new Scene()
  };
}

export function NoopLoader(): AssetLoader {
  return {
    downloader: null,
    builder: null,
    builderProcessTime: 0
  }
}

function getDesktopTargetUrl(): string {
  const configuredTarget = process.env.NEXT_PUBLIC_TARGET_URL?.trim();
  const useSameOriginDesktop =
    process.env.NEXT_PUBLIC_USE_SAME_ORIGIN_DESKTOP === '1' ||
    process.env.NEXT_PUBLIC_USE_SAME_ORIGIN_DESKTOP === 'true';

  if (configuredTarget) {
    return new URL(configuredTarget, window.location.href).toString();
  }

  if (process.env.NODE_ENV === 'production' || useSameOriginDesktop) {
    return new URL('/desktop/', window.location.origin).toString();
  }

  return new URL(`${window.location.protocol}//${window.location.hostname}:3001/`).toString();
}

export { getDesktopTargetUrl };

function getMonitorShellUrl(): string {
  const monitorUrl = new URL('/osdc-monitor.html', window.location.origin);
  const currentSearch = new URLSearchParams(window.location.search);

  monitorUrl.searchParams.set('desktopUrl', getDesktopTargetUrl());
  monitorUrl.searchParams.set('mode', 'lite');

  if (currentSearch.has('debug')) {
    monitorUrl.searchParams.set('debug', '1');
  }

  if (currentSearch.has('perfNoGlobe')) {
    monitorUrl.searchParams.set('perfNoGlobe', currentSearch.get('perfNoGlobe') ?? '1');
  }

  if (currentSearch.has('perfNoGlobePreview')) {
    monitorUrl.searchParams.set('perfNoGlobePreview', currentSearch.get('perfNoGlobePreview') ?? '1');
  }

  if (currentSearch.has('wallpaper')) {
    monitorUrl.searchParams.set('wallpaper', currentSearch.get('wallpaper') ?? '');
  }

  return monitorUrl.toString();
}

function getPhoneShellUrl(): string {
  const phoneUrl = new URL('/pocket', window.location.origin);
  const currentSearch = new URLSearchParams(window.location.search);

  if (currentSearch.has('debug')) {
    phoneUrl.searchParams.set('debug', '1');
  }

  return phoneUrl.toString();
}

function shouldDisablePhoneIframe(): boolean {
  return hasPerfFlag('perfNoPhoneIframe');
}

function shouldDisableMonitorIframe(): boolean {
  return hasPerfFlag('perfNoMonitorIframe');
}

function shouldDisablePortal(): boolean {
  return hasPerfFlag('perfNoPortal');
}

export function LightsLoader(): AssetLoader {
  function builder(context: AssetManagerContext): OptionalUpdateAction {
    const ambientLight = new AmbientLight(0x5f6980, 1.8);
    const roomLight = new HemisphereLight(0xb9c8df, 0x1f2430, 2.35);
    const keyLight = new DirectionalLight(0xf6f0df, 3.25);
    const deskFill = new PointLight(0x8ebfff, 18, 16, 2);
    const lampGlow = new SpotLight(0xffd79a, 28, 20, degToRad(34), 0.45, 1.3);

    roomLight.position.set(0, 13.5, -1.5);

    keyLight.position.set(8.5, 11.5, 6.5);
    keyLight.target.position.set(0.25, 4.7, -2.8);

    deskFill.position.set(1.4, 5.4, -1.3);

    lampGlow.position.set(-4.2, 9.1, -2.1);
    lampGlow.target.position.set(-0.2, 4.5, -2.7);

    context.scenes.sourceScene.add(ambientLight);
    context.scenes.sourceScene.add(roomLight);
    context.scenes.sourceScene.add(keyLight);
    context.scenes.sourceScene.add(keyLight.target);
    context.scenes.sourceScene.add(deskFill);
    context.scenes.sourceScene.add(lampGlow);
    context.scenes.sourceScene.add(lampGlow.target);

    return null;
  }

  return {
    downloader: null,
    builder,
    builderProcessTime: 0
  }
}

export function FloorLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const textureLoader = async () => { texture = await loadTexture(context, '/assets/SmoothFloor.jpg'); }
    const assetLoader   = async () => { asset = await loadModel(context, '/assets/SmoothFloor.glb'); }

    await Promise.all([textureLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!texture) { return null; }
    if (!asset) { return null; }

    enableCameraCollision(asset);

    context.scenes.sourceScene.add(asset.scene);

    const material = new MeshBasicMaterial({ map: texture });
    asset.scene.traverse((node) => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function DeskLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const textureLoader = async () => { texture = await loadTexture(context, '/assets/Desk.jpg'); }
    const assetLoader   = async () => { asset = await loadModel(context, '/assets/Desk.glb'); }

    await Promise.all([textureLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!texture) { return null; }
    if (!asset) { return null; }

    for (const obj of asset.scene.children) {
      obj.userData[AssetKeys.CameraCollidable] = true;
    }

    const material = new MeshBasicMaterial({ map: texture });
    asset.scene.traverse((node) => {
      if (!(node instanceof Mesh)) { return; }

      if (node.name === DeskName) {
        node.material = material;
      }
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function MonitorLoader(): AssetLoader {
  let monitorTexture: Texture | null = null;
  let computerTexture: Texture | null = null;
  let namePlateTexture: Texture | null = null;

  let asset: GLTF | null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const monitorLoader   = async () => { monitorTexture = await loadTexture(context, '/assets/Monitor.jpg'); }
    const computerLoader  = async () => { computerTexture = await loadTexture(context, '/assets/Computer.jpg'); }
    const namePlateLoader = async () => { namePlateTexture = await loadTexture(context, '/assets/NamePlate.svg'); }
    const assetLoader     = async () => { asset = await loadModel(context, '/assets/Monitor.glb'); }

    await Promise.all([monitorLoader(), computerLoader(), namePlateLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }
    if (!monitorTexture || !computerTexture) { return null; }

    asset.scene.name = DisplayParentName;

    const displayMaterial = new MeshBasicMaterial({ color: 0x000000 });
    displayMaterial.stencilWrite = true;
    displayMaterial.transparent = true;

    const monitorMaterial   = new MeshBasicMaterial({ map: monitorTexture });
    const computerMaterial  = new MeshBasicMaterial({ map: computerTexture });
    const nameplateMaterial = new MeshBasicMaterial({ map: namePlateTexture });

    asset.scene.traverse((node) => {
      if (!(node instanceof Mesh)) { return; }

      switch (node.name) {
        case DisplayName:
          node.material = displayMaterial;
          break;
        case MonitorName:
          node.material = monitorMaterial;
          break;
        case ComputerName:
          node.material = computerMaterial;
          break;
        case NamePlateName:
          node.material = nameplateMaterial;
          break;
      }
    });

    const display = asset.scene.children.find((x) => x.name === DisplayName) as Mesh<BufferGeometry, Material>;
    const cutoutDisplay = display.clone();
    display.visible = false;

    const box = display.geometry.boundingBox ?? new Box3();

    const pageWidth = 1280;
    const pageHeight = 980;

    // Use a slightly higher margin on Safari, as 0.1 gives white lines and 0.2 is too big for other browser to look nice.
    const margin = isSafari() ? 0.2 : 0.1;

    const width   = (box.max.x - box.min.x) + margin;
    const height  = width * (pageHeight / pageWidth);
    const depth   = (box.max.z - box.min.z);

    const planeHeight = Math.sqrt(Math.pow(depth, 2) + Math.pow(height, 2));

    const viewHeightScale = planeHeight / pageHeight;
    const viewWidthScale  = width / pageWidth;

    // TODO: Calculate the correct aspect ratio for the content
    const container = document.createElement('div');
    container.style.width = `${pageWidth}px`;
    container.style.height = `${pageHeight}px`;
    container.style.backgroundColor = 'black';

    const iframe = document.createElement('iframe');
    iframe.id = 'operating-system-iframe';
    iframe.classList.add("iframe-container");
    iframe.style.width = `100%`;
    iframe.style.height = `100%`;
    iframe.style.backgroundColor = 'black';
    iframe.style.boxSizing = 'border-box';
    iframe.style.padding = '32px';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    if (shouldDisableMonitorIframe()) {
      console.info('[MonitorLoader] monitor iframe disabled by perf flag');
    } else {
      iframe.src = getMonitorShellUrl();
    }

    container.appendChild(iframe);
    const cssPage = new CSS3DObject(container);

    const [localX, localY, localZ] = [
      (box.min.x - margin / 2) + width / 2,
      (box.min.y - margin / 2) + height / 2,
      box.min.z + depth / 2
    ];

    const [x, y, z] = [
      cutoutDisplay.position.x + localX,
      cutoutDisplay.position.y + localY,
      cutoutDisplay.position.z + localZ
    ];

    cssPage.position.set(x, y, z)

    cssPage.scale.set(viewWidthScale, viewHeightScale, 1);
    cssPage.rotateX(Math.atan(height / depth) - degToRad(90));

    context.scenes.cssScene.add(cssPage);
    context.scenes.sourceScene.add(asset.scene);
    context.scenes.cutoutScene.add(cutoutDisplay);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 250
  }
}

export function KeyboardLoader(): AssetLoader {
  let caseTexture: Texture | null = null;
  let keyCapTexture: Texture | null = null;

  let asset: GLTF | null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const caseTextureLoader   = async () => { caseTexture = await loadTexture(context, '/assets/KeyboardCase.jpg'); }
    const keyCapTextureLoader = async () => { keyCapTexture = await loadTexture(context, '/assets/KeyboardKeyCaps.jpg'); }

    const assetLoader = async () => { asset = await loadModel(context, '/assets/Keyboard.glb'); }

    await Promise.all([
      caseTextureLoader(),
      keyCapTextureLoader(),
      assetLoader()
    ]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }
    if (!caseTexture || !keyCapTexture) { return null; }

    enableCameraCollision(asset);

    const caseMaterial    = new MeshBasicMaterial({ map: caseTexture });
    const keyCapMaterial  = new MeshBasicMaterial({ map: keyCapTexture });

    asset.scene.traverse((node) => {
      if (!(node instanceof Mesh)) { return; }

      if (node.name === "Case") {
        node.material = caseMaterial;
      } else {
        node.material = keyCapMaterial;
      }
    })

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function MouseLoader(): AssetLoader {
  let texture: Texture | null = null;
  let asset: GLTF | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const textureLoader = async () => { texture = await loadTexture(context, '/assets/Mouse.jpg'); }
    const assetLoader = async () => { asset = await loadModel(context, '/assets/Mouse.glb'); }

    await Promise.all([textureLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }
    if (!texture) { return null; }

    const material = new MeshBasicMaterial({ map: texture });

    asset.scene.traverse(node => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function CablesLoader(): AssetLoader {
  let asset: GLTF | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    asset = await loadModel(context, '/assets/Cables.gltf');
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    const material = new MeshBasicMaterial({ color: 0x303030 });

    asset.scene.traverse(node => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function HydraLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const assetLoader = async () => { asset = await loadModel(context, '/assets/Hydra.glb'); }
    const textureLoader = async () => { texture = await loadTexture(context, '/assets/Hydra.jpg'); }

    await Promise.all([assetLoader(), textureLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    let material = new MeshBasicMaterial({ map: texture });

    asset.scene.traverse(node => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
      node.material.side = DoubleSide; // We need to do this, otherwise the ears are transparent
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function PlantLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const assetLoader = async () => { asset = await loadModel(context, '/assets/Plant.glb'); }
    const textureLoader = async () => { texture = await loadTexture(context, '/assets/Plant.jpg'); }

    await Promise.all([assetLoader(), textureLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    let material = new MeshBasicMaterial({ map: texture });

    asset.scene.traverse(node => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function createOfficeTargetVector(target: { x: number, y: number, z: number }): Vector3 {
  return new Vector3(target.x, target.y, target.z);
}

function placeSceneInOfficeSpace(scene: Object3D): Object3D {
  const bounds = new Box3().setFromObject(scene);

  scene.scale.setScalar(OfficeSceneScale);
  scene.position.set(
    OfficeScenePosition.x,
    OfficeScenePosition.y - (bounds.min.y * OfficeSceneScale),
    OfficeScenePosition.z
  );
  scene.updateMatrixWorld(true);

  return scene;
}

function cloneDecorSubtree(gltf: GLTF, rootName: string): Object3D | null {
  const scene = gltf.scene.clone(true);
  const root = scene.getObjectByName(rootName);

  return root ? root.clone(true) : null;
}

function cloneWorldPlacedDecorRoot(gltf: GLTF, rootName: string): Object3D | null {
  const scene = placeSceneInOfficeSpace(gltf.scene.clone(true));
  const root = scene.getObjectByName(rootName);

  if (!root) {
    return null;
  }

  root.updateWorldMatrix(true, true);

  const clone = root.clone(true);
  const worldPosition = new Vector3();
  const worldQuaternion = new Quaternion();
  const worldScale = new Vector3();

  root.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
  clone.position.copy(worldPosition);
  clone.quaternion.copy(worldQuaternion);
  clone.scale.copy(worldScale);
  clone.updateMatrixWorld(true);

  return clone;
}

function collectNodeNames(root: Object3D): Set<string> {
  const names = new Set<string>();

  root.traverse((node) => {
    if (node.name) {
      names.add(node.name);
    }
  });

  return names;
}

function findRelevantAnimationClips(gltf: GLTF, root: Object3D): AnimationClip[] {
  const nodeNames = collectNodeNames(root);

  return gltf.animations.filter((clip) =>
    clip.tracks.some((track) => nodeNames.has(track.name.split('.')[0] ?? ''))
  );
}

function findAnimationClipByName(clips: AnimationClip[], parts: string[]): AnimationClip | null {
  for (const part of parts) {
    const match = clips.find((clip) => clip.name.toLowerCase().includes(part));

    if (match) {
      return match;
    }
  }

  return null;
}

function findScreenMesh(root: Object3D): Mesh | null {
  for (const name of PhoneScreenObjectNames) {
    const candidate = root.getObjectByName(name);

    if (candidate instanceof Mesh) {
      return candidate;
    }
  }

  return null;
}

function getFirstObjectByName<T extends Object3D>(root: Object3D, names: string[]): T | null {
  for (const name of names) {
    const object = root.getObjectByName(name);
    if (object) {
      return object as T;
    }
  }

  return null;
}

type MeshSurfacePlane = {
  height: number,
  heightAxis: Vector3,
  normalAxis: Vector3,
  planeCenter: Vector3,
  rotation: Quaternion,
  widthAxis: Vector3,
  width: number,
};

type PhoneSurfacePlane = MeshSurfacePlane & {
  localSize?: Vector3,
  worldQuaternion?: Quaternion,
};

type PhoneScreenCandidate = {
  mesh: Mesh,
  plane: MeshSurfacePlane,
  boundsSize: Vector3,
  boundsCenter: Vector3,
  materialNames: string[],
  distanceToPhoneCenter: number,
  area: number,
  aspect: number,
  longSide: number,
  shortSide: number,
  score: number,
  rejectReason: string | null,
  exactName: boolean,
  exactPreferredName: boolean,
  keywordMatch: boolean,
  parentKeywordMatch: boolean,
  materialKeywordMatch: boolean,
};

function includesPhoneKeyword(value: string): boolean {
  const lowered = value.toLowerCase();
  return (
    lowered.includes('object_8') ||
    lowered.includes('screen') ||
    lowered.includes('iphone') ||
    lowered.includes('phone') ||
    lowered.includes('display') ||
    lowered.includes('glass')
  );
}

function isDescendantOf(node: Object3D, root: Object3D): boolean {
  let current: Object3D | null = node;

  while (current) {
    if (current === root) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function findBestPhoneScreenMesh(root: Object3D): Mesh | null {
  const rootBounds = new Box3().setFromObject(root);
  const rootCenter = rootBounds.getCenter(new Vector3());
  const rootSize = rootBounds.getSize(new Vector3());
  const sortedRootDimensions = [rootSize.x, rootSize.y, rootSize.z].sort((a, b) => b - a);
  const rootLongSide = Math.max(sortedRootDimensions[0], 0.001);
  const rootMediumSide = Math.max(sortedRootDimensions[1], 0.001);
  const viewerTarget = new Vector3(
    OfficeSeatCameraTarget.x,
    OfficeSeatCameraTarget.y,
    OfficeSeatCameraTarget.z
  );
  const candidates: PhoneScreenCandidate[] = [];

  root.traverse((node) => {
    if (!(node instanceof Mesh)) { return; }

    const plane = resolveMeshSurfacePlane(node, viewerTarget);
    if (!plane) { return; }

    const bounds = new Box3().setFromObject(node);
    const boundsSize = bounds.getSize(new Vector3());
    const boundsCenter = bounds.getCenter(new Vector3());
    const area = plane.width * plane.height;
    const shortSide = Math.min(plane.width, plane.height);
    const longSide = Math.max(plane.width, plane.height);
    const aspect = shortSide / Math.max(longSide, 0.0001);
    const materialNames = listMaterialNames(node.material);
    const distanceToPhoneCenter = boundsCenter.distanceTo(rootCenter);
    const exactName = PhoneScreenObjectNames.includes(node.name);
    const exactPreferredName = node.name === PhoneScreenObjectNames[0];
    const keywordMatch = includesPhoneKeyword(node.name);
    const parentKeywordMatch = includesPhoneKeyword(node.parent?.name ?? '');
    const materialKeywordMatch = materialNames.some((name) => includesPhoneKeyword(name));

    let rejectReason: string | null = null;

    if (area < 0.0025) {
      rejectReason = 'area-too-small';
    } else if (aspect < 0.28 || aspect > 0.82) {
      rejectReason = 'aspect-out-of-range';
    } else if (longSide > rootLongSide * 1.02) {
      rejectReason = 'plane-longer-than-phone-body';
    } else if (shortSide > rootMediumSide * 1.02) {
      rejectReason = 'plane-wider-than-phone-body';
    } else if (distanceToPhoneCenter > rootLongSide * 0.85) {
      rejectReason = 'too-far-from-phone-body-center';
    }

    const score =
      (exactPreferredName ? 10 : 0) +
      (exactName ? 5 : 0) +
      (keywordMatch ? 2.5 : 0) +
      (parentKeywordMatch ? 2 : 0) +
      (materialKeywordMatch ? 1.5 : 0) +
      (1 - Math.abs(aspect - 0.56)) * 4 +
      Math.max(0, 2.4 - (distanceToPhoneCenter / rootLongSide) * 3) +
      Math.max(0, 1.5 - Math.abs((longSide / rootLongSide) - 0.82) * 3);

    candidates.push({
      mesh: node,
      plane,
      boundsSize,
      boundsCenter,
      materialNames,
      distanceToPhoneCenter,
      area,
      aspect,
      longSide,
      shortSide,
      score,
      rejectReason,
      exactName,
      exactPreferredName,
      keywordMatch,
      parentKeywordMatch,
      materialKeywordMatch,
    });
  });

  const saneCandidates = candidates
    .filter((candidate) => candidate.rejectReason === null)
    .sort((a, b) => b.score - a.score);

  return saneCandidates[0]?.mesh ?? findScreenMesh(root);
}

function findSceneObject<T extends Object3D>(scene: Scene, names: string[]): T | null {
  for (const name of names) {
    const candidate = scene.getObjectByName(name);

    if (candidate) {
      return candidate as T;
    }
  }

  return null;
}

function resolveMeshSurfacePlane(mesh: Mesh, viewerTarget: Vector3): MeshSurfacePlane | null {
  const geometry = mesh.geometry as BufferGeometry;
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');

  if (!positions) {
    return null;
  }

  const worldBounds = new Box3().setFromObject(mesh);
  const worldCenter = worldBounds.getCenter(new Vector3());
  const fallbackForward = new Vector3(0, 0, 1).transformDirection(mesh.matrixWorld).normalize();
  const toViewer = viewerTarget.clone().sub(worldCenter).normalize();
  const normalAxis = new Vector3();
  const worldNormal = new Vector3();

  if (normals) {
    for (let index = 0; index < normals.count; index += 1) {
      worldNormal
        .fromBufferAttribute(normals, index)
        .transformDirection(mesh.matrixWorld);

      normalAxis.add(worldNormal);
    }
  }

  if (normalAxis.lengthSq() < 0.0001) {
    normalAxis.copy(fallbackForward);
  } else {
    normalAxis.normalize();
  }

  if (normalAxis.dot(toViewer) < 0) {
    normalAxis.multiplyScalar(-1);
  }

  const upVector = new Vector3(0, 1, 0);
  const heightAxis = upVector.clone().sub(
    normalAxis.clone().multiplyScalar(upVector.dot(normalAxis))
  );

  if (heightAxis.lengthSq() < 0.0001) {
    heightAxis.set(0, 0, 1).sub(normalAxis.clone().multiplyScalar(normalAxis.z));
  }

  heightAxis.normalize();

  const widthAxis = heightAxis.clone().cross(normalAxis).normalize();
  const worldVertex = new Vector3();
  const relativeVertex = new Vector3();

  let minWidth = Number.POSITIVE_INFINITY;
  let maxWidth = Number.NEGATIVE_INFINITY;
  let minHeight = Number.POSITIVE_INFINITY;
  let maxHeight = Number.NEGATIVE_INFINITY;
  let maxDepth = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < positions.count; index += 1) {
    worldVertex
      .fromBufferAttribute(positions, index)
      .applyMatrix4(mesh.matrixWorld);

    relativeVertex.copy(worldVertex).sub(worldCenter);

    const widthProjection = relativeVertex.dot(widthAxis);
    const heightProjection = relativeVertex.dot(heightAxis);
    const depthProjection = relativeVertex.dot(normalAxis);

    minWidth = Math.min(minWidth, widthProjection);
    maxWidth = Math.max(maxWidth, widthProjection);
    minHeight = Math.min(minHeight, heightProjection);
    maxHeight = Math.max(maxHeight, heightProjection);
    maxDepth = Math.max(maxDepth, depthProjection);
  }

  const planeCenter = worldCenter.clone().add(normalAxis.clone().multiplyScalar(maxDepth));
  const width = maxWidth - minWidth;
  const height = maxHeight - minHeight;
  const basis = new Matrix4().makeBasis(widthAxis, heightAxis, normalAxis);
  const rotation = new Quaternion().setFromRotationMatrix(basis);

  return {
    height,
    heightAxis,
    normalAxis,
    planeCenter,
    rotation,
    widthAxis,
    width,
  };
}

function formatQuaternion(quaternion: Quaternion): string {
  return [quaternion.x, quaternion.y, quaternion.z, quaternion.w]
    .map((value) => value.toFixed(4))
    .join(', ');
}

function resolvePhoneScreenPlane(mesh: Mesh, viewerTarget: Vector3): PhoneSurfacePlane | null {
  const geometry = mesh.geometry as BufferGeometry;
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }

  const localBounds = geometry.boundingBox;
  if (!localBounds) {
    return resolveMeshSurfacePlane(mesh, viewerTarget);
  }

  const localSize = localBounds.getSize(new Vector3());
  const localCenter = localBounds.getCenter(new Vector3());
  const worldCenter = mesh.localToWorld(localCenter.clone());
  const worldQuaternion = mesh.getWorldQuaternion(new Quaternion());
  const viewerDirection = viewerTarget.clone().sub(worldCenter).normalize();
  const axisMeta = [
    { size: localSize.x, axis: new Vector3(1, 0, 0) },
    { size: localSize.y, axis: new Vector3(0, 1, 0) },
    { size: localSize.z, axis: new Vector3(0, 0, 1) },
  ].sort((a, b) => a.size - b.size);

  let normalAxis = axisMeta[0].axis.clone().transformDirection(mesh.matrixWorld).normalize();
  let widthAxis = axisMeta[1].axis.clone().transformDirection(mesh.matrixWorld).normalize();
  let heightAxis = axisMeta[2].axis.clone().transformDirection(mesh.matrixWorld).normalize();

  if (widthAxis.clone().cross(heightAxis).dot(normalAxis) < 0) {
    widthAxis.multiplyScalar(-1);
  }

  if (normalAxis.dot(viewerDirection) < 0) {
    normalAxis.multiplyScalar(-1);
    widthAxis.multiplyScalar(-1);
  }

  let width = axisMeta[1].size;
  let height = axisMeta[2].size;
  let rotation = new Quaternion().setFromRotationMatrix(
    new Matrix4().makeBasis(widthAxis, heightAxis, normalAxis)
  );

  if (width > height) {
    [width, height] = [height, width];
    const rotatedWidthAxis = heightAxis.clone();
    const rotatedHeightAxis = widthAxis.clone().multiplyScalar(-1);
    widthAxis = rotatedWidthAxis;
    heightAxis = rotatedHeightAxis;
    rotation = new Quaternion().setFromRotationMatrix(
      new Matrix4().makeBasis(widthAxis, heightAxis, normalAxis)
    );
  }

  if (PhoneScreenRotationOffset !== 0) {
    rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), PhoneScreenRotationOffset));
  }

  return {
    height,
    heightAxis,
    localSize,
    normalAxis,
    planeCenter: worldCenter,
    rotation,
    widthAxis,
    width,
    worldQuaternion,
  };
}

function listMaterialNames(material: Material | Material[]): string[] {
  const materials = Array.isArray(material) ? material : [material];

  return materials
    .map((entry) => entry.name || entry.type)
    .filter((name, index, names) => Boolean(name) && names.indexOf(name) === index);
}

function formatVector(vector: Vector3): string {
  return [vector.x, vector.y, vector.z]
    .map((value) => value.toFixed(4))
    .join(', ');
}

function findBestPhoneScreenMeshInScene(scene: Scene, phoneRoot: Object3D | null): Mesh | null {
  const viewerTarget = new Vector3(
    OfficeSeatCameraTarget.x,
    OfficeSeatCameraTarget.y,
    OfficeSeatCameraTarget.z
  );
  const phoneBounds = phoneRoot ? new Box3().setFromObject(phoneRoot) : null;
  const phoneCenter = phoneBounds?.getCenter(new Vector3()) ?? new Vector3();
  const phoneSize = phoneBounds?.getSize(new Vector3()) ?? null;
  const phoneDimensions = phoneSize
    ? [phoneSize.x, phoneSize.y, phoneSize.z].sort((a, b) => b - a)
    : null;
  const phoneLongSide = Math.max(phoneDimensions?.[0] ?? 0, 0.001);
  const phoneMediumSide = Math.max(phoneDimensions?.[1] ?? 0, 0.001);
  const candidates: PhoneScreenCandidate[] = [];

  scene.traverse((node) => {
    if (!(node instanceof Mesh)) { return; }

    const materialNames = listMaterialNames(node.material);
    const nodeMatchesKeyword =
      includesPhoneKeyword(node.name) ||
      includesPhoneKeyword(node.parent?.name ?? '') ||
      materialNames.some((name) => includesPhoneKeyword(name));
    const underPhoneRoot = phoneRoot ? isDescendantOf(node, phoneRoot) : false;
    const exactName = PhoneScreenObjectNames.includes(node.name);

    if (!underPhoneRoot && !nodeMatchesKeyword && !exactName) {
      return;
    }

    const plane = resolveMeshSurfacePlane(node, viewerTarget);
    if (!plane) { return; }

    const bounds = new Box3().setFromObject(node);
    const boundsSize = bounds.getSize(new Vector3());
    const boundsCenter = bounds.getCenter(new Vector3());
    const area = plane.width * plane.height;
    const shortSide = Math.min(plane.width, plane.height);
    const longSide = Math.max(plane.width, plane.height);
    const aspect = shortSide / Math.max(longSide, 0.0001);
    const distanceToPhoneCenter = phoneRoot ? boundsCenter.distanceTo(phoneCenter) : 0;
    const exactPreferredName = node.name === PhoneScreenObjectNames[0];
    const keywordMatch = includesPhoneKeyword(node.name);
    const parentKeywordMatch = includesPhoneKeyword(node.parent?.name ?? '');
    const materialKeywordMatch = materialNames.some((name) => includesPhoneKeyword(name));

    let rejectReason: string | null = null;

    if (area < 0.0025) {
      rejectReason = 'area-too-small';
    } else if (aspect < 0.28 || aspect > 0.82) {
      rejectReason = 'aspect-out-of-range';
    } else if (phoneSize && longSide > phoneLongSide * 1.02) {
      rejectReason = 'plane-longer-than-phone-body';
    } else if (phoneSize && shortSide > phoneMediumSide * 1.02) {
      rejectReason = 'plane-wider-than-phone-body';
    } else if (phoneRoot && distanceToPhoneCenter > phoneLongSide * 0.85) {
      rejectReason = 'too-far-from-phone-body-center';
    } else if (node.name === PhoneScreenObjectNames[1] && longSide > 2.25) {
      rejectReason = 'object_8-plane-implausibly-large';
    }

    const score =
      (exactPreferredName ? 10 : 0) +
      (exactName ? 5 : 0) +
      (underPhoneRoot ? 3 : 0) +
      (keywordMatch ? 2.5 : 0) +
      (parentKeywordMatch ? 2 : 0) +
      (materialKeywordMatch ? 1.5 : 0) +
      (1 - Math.abs(aspect - 0.56)) * 4 +
      (phoneRoot ? Math.max(0, 2.4 - (distanceToPhoneCenter / phoneLongSide) * 3) : 1.2) +
      (phoneSize ? Math.max(0, 1.5 - Math.abs((longSide / phoneLongSide) - 0.82) * 3) : 0);

    candidates.push({
      mesh: node,
      plane,
      boundsSize,
      boundsCenter,
      materialNames,
      distanceToPhoneCenter,
      area,
      aspect,
      longSide,
      shortSide,
      score,
      rejectReason,
      exactName,
      exactPreferredName,
      keywordMatch,
      parentKeywordMatch,
      materialKeywordMatch,
    });
  });

  console.groupCollapsed('[PhoneLoader] phone screen candidates');
  for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
    console.log('[PhoneLoader] candidate mesh=%s parent=%s materials=[%s] boundsSize=[%s] center=[%s] normal=[%s] area=%f aspect=%f distance=%f flags=%o reject=%s score=%f',
      candidate.mesh.name || '(unnamed)',
      candidate.mesh.parent?.name ?? '(no parent)',
      candidate.materialNames.join(', '),
      formatVector(candidate.boundsSize),
      formatVector(candidate.boundsCenter),
      formatVector(candidate.plane.normalAxis),
      candidate.area,
      candidate.aspect,
      candidate.distanceToPhoneCenter,
      {
        object8: candidate.mesh.name.includes('Object_8'),
        screen: candidate.keywordMatch,
        phoneParent: candidate.parentKeywordMatch,
        materialKeyword: candidate.materialKeywordMatch,
        preferredObject8001: candidate.exactPreferredName,
      },
      candidate.rejectReason ?? 'accepted',
      candidate.score
    );
  }
  console.groupEnd();

  const saneCandidates = candidates
    .filter((candidate) => candidate.rejectReason === null)
    .sort((a, b) => b.score - a.score);

  return saneCandidates[0]?.mesh ?? null;
}

function logPhoneSurfaceDebug(mesh: Mesh, plane: MeshSurfacePlane | PhoneSurfacePlane | null): void {
  if (!plane) { return; }

  console.info(
    `[PhoneLoader] screen mesh=${mesh.name || '(unnamed)'} materials=[${listMaterialNames(mesh.material).join(', ')}] width=${plane.width.toFixed(4)} height=${plane.height.toFixed(4)} normal=[${formatVector(plane.normalAxis)}] widthAxis=[${formatVector(plane.widthAxis)}]`
  );
}

function logPortalAnimationDebug(scene: Object3D, clips: AnimationClip[]): void {
  const meshNames = new Set<string>();
  const materialNames = new Set<string>();

  scene.traverse((node) => {
    if (!(node instanceof Mesh)) { return; }

    meshNames.add(node.name || '(unnamed mesh)');

    for (const materialName of listMaterialNames(node.material)) {
      materialNames.add(materialName);
    }
  });

  console.groupCollapsed('[PortalLoader] debug inventory');
  console.info('meshes', [...meshNames]);
  console.info('materials', [...materialNames]);

  for (const clip of clips) {
    console.info(`clip ${clip.name} duration=${clip.duration.toFixed(3)} tracks=${clip.tracks.length}`);
    for (const track of clip.tracks) {
      console.info(`  track ${track.name}`);
    }
  }

  console.groupEnd();
}

function preferPortalClip(clips: AnimationClip[]): AnimationClip | null {
  return findAnimationClipByName(clips, ['ativazione', 'spawning', 'stand by', 'walking']) ?? clips[0] ?? null;
}

function createPortalManualAnimation(root: Object3D, portalGlow: PointLight): UpdateAction {
  const swayRoot = root.getObjectByName('portal') ?? root;
  const scaleTarget = root.getObjectByName('thethingportal') ?? swayRoot;
  const emissiveMaterials: MeshStandardMaterial[] = [];
  const baseRotation = swayRoot.rotation.clone();
  const baseScale = scaleTarget.scale.clone();
  const baseGlowIntensity = portalGlow.intensity;

  root.traverse((node) => {
    if (!(node instanceof Mesh)) { return; }

    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      if (material instanceof MeshStandardMaterial) {
        emissiveMaterials.push(material);
      }
    }
  });

  let elapsed = 0;

  return (deltaTime: number) => {
    elapsed += deltaTime;

    swayRoot.rotation.x = baseRotation.x + Math.sin(elapsed * 0.55) * 0.04;
    swayRoot.rotation.y = baseRotation.y + Math.sin(elapsed * 0.72) * 0.12;
    swayRoot.rotation.z = baseRotation.z + Math.sin(elapsed * 0.48) * 0.025;

    const scalePulse = 1 + Math.sin(elapsed * 1.45) * 0.06;
    scaleTarget.scale.set(
      baseScale.x * scalePulse,
      baseScale.y * scalePulse,
      baseScale.z * scalePulse
    );

    portalGlow.intensity = baseGlowIntensity * (0.92 + (Math.sin(elapsed * 1.8) + 1) * 0.14);

    const emissivePulse = 0.75 + (Math.sin(elapsed * 1.95) + 1) * 0.3;
    for (const material of emissiveMaterials) {
      material.emissiveIntensity = emissivePulse;
      material.needsUpdate = true;
    }
  };
}

export function OfficeEnvironmentLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let portalAnimationAsset: GLTF | null = null;
  let usingSharedOfficeScene = false;

  async function downloader(context: AssetManagerContext): Promise<void> {
    asset = await loadSharedDecorAsset(context);
    portalAnimationAsset = null;
    usingSharedOfficeScene = true;

    console.info('[OfficeEnvironmentLoader] using required scene:', getSharedDecorAssetUrl(), 'usingSharedOfficeScene=', usingSharedOfficeScene);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    const officeScene = asset.scene;
    placeSceneInOfficeSpace(officeScene);

    officeScene.traverse((node) => {
      if (!(node instanceof Mesh)) { return; }

      node.userData[AssetKeys.CameraCollidable] = true;
    });

    const updateActions: UpdateAction[] = [];

    const portalPerfDisabled = shouldDisablePortal();
    const portalClips = portalAnimationAsset?.animations ?? asset.animations ?? [];
    const standbyClip = preferPortalClip(portalClips);

    if (context.debug) {
      const debugScene = portalAnimationAsset
        ? placeSceneInOfficeSpace(portalAnimationAsset.scene.clone(true))
        : officeScene;

      logPortalAnimationDebug(debugScene, portalClips);
    }

    const portalRoot = getFirstObjectByName(officeScene, DecorPortalRootNames);
    let portalMixer: AnimationMixer | null = null;
    let debugProbeMixer: AnimationMixer | null = null;
    let debugProbeScene: Object3D | null = null;
    let manualPortalAnimation: UpdateAction | null = null;
    const portalVisibilityTargets: Object3D[] = [];

    console.info('[PortalLoader] portalRoot', portalRoot?.name ?? 'not found');

    if (!portalRoot && context.debug) {
      officeScene.traverse((node) => {
        const loweredName = node.name.toLowerCase();
        if (
          node.name.includes('Sketchfab_model') ||
          loweredName.includes('portal') ||
          loweredName.includes('thing') ||
          loweredName.includes('ativazione')
        ) {
          console.info('[PortalLoader] candidate node', node.name, node.type, node.parent?.name);
        }
      });
    }

    if (portalRoot) {
      portalRoot.traverse((node) => {
        node.userData[AssetKeys.CameraCollidable] = false;
        node.matrixAutoUpdate = true;

        if (node instanceof Mesh) {
          node.frustumCulled = false;
        }
      });

      portalVisibilityTargets.push(portalRoot);

      if (context.debug && standbyClip && portalAnimationAsset) {
        debugProbeScene = placeSceneInOfficeSpace(portalAnimationAsset.scene.clone(true));
        const debugProbeRoot = getFirstObjectByName(debugProbeScene, DecorPortalRootNames);

        debugProbeScene.traverse((node) => {
          node.userData[AssetKeys.CameraCollidable] = false;
          node.matrixAutoUpdate = true;

          if (node instanceof Mesh) {
            node.frustumCulled = false;
          }
        });

        if (debugProbeRoot) {
          const probeBounds = new Box3().setFromObject(debugProbeRoot);
          const probeSize = probeBounds.getSize(new Vector3());

          debugProbeScene.position.add(new Vector3(
            Math.max(probeSize.x * 1.75, 0.35),
            Math.max(probeSize.y * 0.18, 0.12),
            Math.max(probeSize.z * 1.2, 0.18)
          ));
          debugProbeScene.scale.multiplyScalar(1.18);
          debugProbeScene.updateMatrixWorld(true);
          context.scenes.sourceScene.add(debugProbeScene);
          portalVisibilityTargets.push(debugProbeScene);

          debugProbeMixer = new AnimationMixer(debugProbeScene);
          const debugProbeAction = debugProbeMixer.clipAction(standbyClip);
          debugProbeAction.enabled = true;
          debugProbeAction.reset();
          debugProbeAction.setLoop(LoopPingPong, Infinity);
          debugProbeAction.setEffectiveTimeScale(1);
          debugProbeAction.setEffectiveWeight(1);
          debugProbeAction.clampWhenFinished = false;
          debugProbeAction.paused = false;
          debugProbeAction.zeroSlopeAtStart = true;
          debugProbeAction.zeroSlopeAtEnd = true;
          debugProbeAction.play();
        }
      }

      const portalBounds = new Box3().setFromObject(portalRoot);
      const portalCenter = portalBounds.getCenter(new Vector3());
      const portalSize = portalBounds.getSize(new Vector3());
      const portalLampSideOffset = new Vector3(
        Math.max(portalSize.x * 0.95, 0.22),
        Math.max(portalSize.y * 0.34, 0.16),
        Math.max(portalSize.z * 0.18, 0.04)
      );
      const portalGlow = new PointLight(0xa05eff, 2.3, 1.6, 1.7);
      portalGlow.position.copy(portalCenter.clone().add(portalLampSideOffset));
      portalGlow.userData[AssetKeys.CameraCollidable] = false;

      const hotspot = new Mesh(
        new BoxGeometry(
          Math.max(portalSize.x * 0.72, 0.12),
          Math.max(portalSize.y * 0.82, 0.16),
          Math.max(portalSize.z * 0.76, 0.1)
        ),
        new MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        })
      );
      hotspot.name = PhotoFrameInteractionZoneName;
      hotspot.material.colorWrite = false;
      hotspot.position.copy(portalCenter);
      hotspot.userData[AssetKeys.CameraCollidable] = false;

      context.scenes.sourceScene.add(portalGlow);
      context.scenes.sourceScene.add(hotspot);

      const visibilityState = { enabled: true };

      (window as Window & {
        toggleSpaceThingy?: (next?: boolean) => boolean;
      }).toggleSpaceThingy = (next?: boolean) => {
        const enabled = typeof next === 'boolean' ? next : !visibilityState.enabled;
        visibilityState.enabled = enabled;
        for (const target of portalVisibilityTargets) {
          target.visible = enabled;
        }
        portalGlow.visible = enabled;
        hotspot.visible = enabled;
        return enabled;
      };

      if (portalPerfDisabled) {
        console.info('[PortalLoader] portal animation disabled by perf flag');
      }

      if (!portalPerfDisabled && standbyClip) {
        portalMixer = new AnimationMixer(officeScene);
        const standbyAction = portalMixer.clipAction(standbyClip);
        standbyAction.enabled = true;
        standbyAction.reset();
        standbyAction.setLoop(LoopPingPong, Infinity);
        standbyAction.setEffectiveTimeScale(1);
        standbyAction.setEffectiveWeight(1);
        standbyAction.clampWhenFinished = false;
        standbyAction.paused = false;
        standbyAction.zeroSlopeAtStart = true;
        standbyAction.zeroSlopeAtEnd = true;
        standbyAction.play();
      } else if (!portalPerfDisabled) {
        manualPortalAnimation = createPortalManualAnimation(portalRoot, portalGlow);
      }

      updateActions.push((deltaTime: number) => {
        if (!visibilityState.enabled || portalPerfDisabled) { return; }

        portalMixer?.update(deltaTime);
        debugProbeMixer?.update(deltaTime);
        officeScene.updateMatrixWorld(true);
        debugProbeScene?.updateMatrixWorld(true);
        manualPortalAnimation?.(deltaTime);
      });
    }

    if (!usingSharedOfficeScene) {
      const roomShell = new Mesh(
        new BoxGeometry(40, 22, 40),
        new MeshBasicMaterial({
          color: 0x353c47,
          side: BackSide,
        })
      );
      roomShell.position.set(0.4, 9.8, -5.8);
      roomShell.userData[AssetKeys.CameraCollidable] = false;

      const floorPlate = new Mesh(
        new PlaneGeometry(28, 28),
        new MeshBasicMaterial({
          color: 0x2b313a,
        })
      );
      floorPlate.position.set(0, 0.02, -4.4);
      floorPlate.rotation.x = -Math.PI / 2;

      const farWall = new Mesh(
        new PlaneGeometry(28, 16),
        new MeshBasicMaterial({
          color: 0x454d59,
        })
      );
      farWall.position.set(0, 7.6, -18.5);

      const sideWall = new Mesh(
        new PlaneGeometry(20, 16),
        new MeshBasicMaterial({
          color: 0x3c434e,
        })
      );
      sideWall.position.set(12.8, 7.8, -6.2);
      sideWall.rotation.y = -Math.PI / 2;

      context.scenes.sourceScene.add(roomShell);
      context.scenes.sourceScene.add(floorPlate);
      context.scenes.sourceScene.add(farWall);
      context.scenes.sourceScene.add(sideWall);
    }

    context.scenes.sourceScene.add(officeScene);

    return updateActions.length > 0 ? updateActions : null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function OfficeDisplayLoader(): AssetLoader {
  async function downloader(): Promise<void> {}

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    context.scenes.sourceScene.updateMatrixWorld(true);

    const anchor = context.scenes.sourceScene.getObjectByName('Object_7_2');

    if (!(anchor instanceof Mesh)) { return null; }

    const anchorGeometry = anchor.geometry as BufferGeometry;
    const anchorPositions = anchorGeometry.getAttribute('position');
    if (!anchorPositions) { return null; }

    const worldCenter = new Vector3();
    new Box3().setFromObject(anchor).getCenter(worldCenter);

    const toViewer = createOfficeTargetVector(OfficeSeatCameraTarget).sub(worldCenter).normalize();
    const upVector = new Vector3(0, 1, 0);
    const fallbackForward = new Vector3(0, 0, 1).transformDirection(anchor.matrixWorld).normalize();
    const anchorNormals = anchorGeometry.getAttribute('normal');
    const normalAxis = new Vector3();
    const worldNormal = new Vector3();

    if (anchorNormals) {
      for (let index = 0; index < anchorNormals.count; index += 1) {
        worldNormal
          .fromBufferAttribute(anchorNormals, index)
          .transformDirection(anchor.matrixWorld);

        normalAxis.add(worldNormal);
      }
    }

    if (normalAxis.lengthSq() < 0.0001) {
      normalAxis.copy(fallbackForward);
    } else {
      normalAxis.normalize();
    }

    if (normalAxis.dot(toViewer) < 0) {
      normalAxis.multiplyScalar(-1);
    }

    const heightAxis = upVector.clone().sub(
      normalAxis.clone().multiplyScalar(upVector.dot(normalAxis))
    );

    if (heightAxis.lengthSq() < 0.0001) {
      heightAxis.set(0, 0, 1).sub(normalAxis.clone().multiplyScalar(normalAxis.z));
    }

    heightAxis.normalize();
    const widthAxis = heightAxis.clone().cross(normalAxis).normalize();

    const worldVertex = new Vector3();
    const relativeVertex = new Vector3();

    let minWidth = Number.POSITIVE_INFINITY;
    let maxWidth = Number.NEGATIVE_INFINITY;
    let minHeight = Number.POSITIVE_INFINITY;
    let maxHeight = Number.NEGATIVE_INFINITY;
    let minDepth = Number.POSITIVE_INFINITY;
    let maxDepth = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < anchorPositions.count; index += 1) {
      worldVertex
        .fromBufferAttribute(anchorPositions, index)
        .applyMatrix4(anchor.matrixWorld);

      relativeVertex.copy(worldVertex).sub(worldCenter);

      const widthProjection = relativeVertex.dot(widthAxis);
      const heightProjection = relativeVertex.dot(heightAxis);
      const depthProjection = relativeVertex.dot(normalAxis);

      minWidth = Math.min(minWidth, widthProjection);
      maxWidth = Math.max(maxWidth, widthProjection);
      minHeight = Math.min(minHeight, heightProjection);
      maxHeight = Math.max(maxHeight, heightProjection);
      minDepth = Math.min(minDepth, depthProjection);
      maxDepth = Math.max(maxDepth, depthProjection);
    }

    const displayWidth = Math.max(0.1, (maxWidth - minWidth) * 1.012);
    const displayHeight = Math.max(0.1, (maxHeight - minHeight) * 1.018);
    const displayPosition = worldCenter.clone().add(normalAxis.clone().multiplyScalar(maxDepth + 0.014));
    const cssScreenPosition = displayPosition.clone().add(normalAxis.clone().multiplyScalar(-0.028));
    const displayQuaternion = new Quaternion().setFromRotationMatrix(
      new Matrix4().makeBasis(widthAxis, heightAxis, normalAxis)
    );

    anchor.visible = false;

    const displayParent = new Object3D();
    displayParent.name = DisplayParentName;

    const pageWidth = 1280;
    const pageHeight = Math.max(960, Math.round(pageWidth * (displayHeight / displayWidth)));

    const container = document.createElement('div');
    container.style.width = `${pageWidth}px`;
    container.style.height = `${pageHeight}px`;
    container.style.backgroundColor = '#000';
    container.style.overflow = 'hidden';

    const iframe = document.createElement('iframe');
    iframe.id = 'operating-system-iframe';
    iframe.classList.add('iframe-container');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.backgroundColor = '#000';
    if (shouldDisableMonitorIframe()) {
      console.info('[MonitorLoader] monitor iframe disabled by perf flag');
    } else {
      iframe.src = getMonitorShellUrl();
    }

    container.appendChild(iframe);

    const cssPage = new CSS3DObject(container);
    const overscan = 1.085;

    cssPage.position.copy(cssScreenPosition);
    cssPage.quaternion.copy(displayQuaternion);
    cssPage.scale.set(
      (displayWidth / pageWidth) * overscan,
      (displayHeight / pageHeight) * overscan,
      1
    );

    const crtMatte = new Mesh(
      new PlaneGeometry(displayWidth * 1.032, displayHeight * 1.036),
      new MeshBasicMaterial({ color: 0x05080d, side: DoubleSide })
    );
    crtMatte.position.copy(displayPosition).add(normalAxis.clone().multiplyScalar(-0.012));
    crtMatte.quaternion.copy(displayQuaternion);

    const displayGeometry = new PlaneGeometry(displayWidth, displayHeight) as BufferGeometry;
    displayGeometry.computeBoundingBox();
    const display = new Mesh<BufferGeometry, Material>(
      displayGeometry,
      new MeshBasicMaterial({ color: 0x000000, side: DoubleSide, transparent: true, opacity: 0 })
    );
    display.name = DisplayName;
    display.userData.useWorldNormalCamera = true;
    display.userData.cameraZoomDistance = 2.05;
    display.userData.cameraVector = normalAxis.clone()
      .add(heightAxis.clone().multiplyScalar(0.2))
      .normalize()
      .toArray();
    display.position.copy(displayPosition);
    display.quaternion.copy(displayQuaternion);

    const cutoutDisplay = display.clone();
    cutoutDisplay.position.copy(displayPosition);
    cutoutDisplay.quaternion.copy(displayQuaternion);
    display.visible = false;

    displayParent.add(display);
    displayParent.add(crtMatte);
    context.scenes.sourceScene.add(displayParent);
    context.scenes.cutoutScene.add(cutoutDisplay);
    context.scenes.cssScene.add(cssPage);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 250
  }
}

export function PhoneLoader(): AssetLoader {
  async function downloader(): Promise<void> {}

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    const scene = context.scenes.sourceScene;
    const cutoutScene = context.scenes.cutoutScene;
    const cssScene = context.scenes.cssScene;
    scene.updateMatrixWorld(true);
    scene.userData[PhoneOverlayFallbackUserDataKey] = false;
    scene.userData[ActivatePhoneIframeUserDataKey] = undefined;

    scene.getObjectByName(PhoneInteractionZoneName)?.removeFromParent();
    scene.getObjectByName(PhoneScreenMatteName)?.removeFromParent();
    scene.getObjectByName(PhoneScreenGlowName)?.removeFromParent();
    scene.getObjectByName(PhoneDebugPlaneName)?.removeFromParent();
    scene.getObjectByName(PhoneDebugAxesName)?.removeFromParent();
    cutoutScene.getObjectByName(PhoneScreenSurfaceName)?.removeFromParent();
    cssScene.getObjectByName(PhoneScreenCssName)?.removeFromParent();

    const phoneRoot =
      getFirstObjectByName(scene, DecorPhoneBodyRootNames) ??
      getFirstObjectByName(scene, DecorPhoneRootNames);
    const nativeScreen =
      phoneRoot
        ? (
            getFirstObjectByName<Mesh>(phoneRoot, PhoneScreenObjectNames) ??
            getFirstObjectByName<Mesh>(phoneRoot, PhoneScreenFallbackObjectNames) ??
            findBestPhoneScreenMesh(phoneRoot)
          )
        : null;

    if (!(nativeScreen instanceof Mesh)) {
      (phoneRoot ?? scene).traverse((node) => {
        const loweredName = node.name.toLowerCase();
        if (
          node.name.includes('Object_8') ||
          node.name.includes('Sketchfab') ||
          loweredName.includes('phone') ||
          loweredName.includes('iphone') ||
          loweredName.includes('screen')
        ) {
          console.log('[PhoneLoader] candidate node', node.name, node.type, node.parent?.name);
        }
      });

      scene.userData[PhoneOverlayFallbackUserDataKey] = true;
      console.warn('[PhoneLoader] phone screen mesh not found under phone root/body; cannot create CSS3D phone iframe');
      return null;
    }

    const asset = phoneRoot ?? nativeScreen.parent ?? nativeScreen;

    asset.traverse((node) => {
      if (!(node instanceof Mesh)) { return; }
      node.userData[AssetKeys.CameraCollidable] = false;
    });

    const updatedBox = new Box3().setFromObject(asset);
    let hotspotCenter = updatedBox.getCenter(new Vector3());
    let hotspotSize = updatedBox.getSize(new Vector3());
    nativeScreen.userData[AssetKeys.CameraCollidable] = false;
    nativeScreen.updateWorldMatrix(true, false);

    const nativeScreenBounds = new Box3().setFromObject(nativeScreen);
    const nativeScreenCenter = nativeScreenBounds.getCenter(new Vector3());
    const nativeScreenSize = nativeScreenBounds.getSize(new Vector3());
    hotspotCenter = nativeScreenCenter.clone();
    hotspotSize = new Vector3(
      Math.max(nativeScreenSize.x * 1.12, 0.12),
      Math.max(nativeScreenSize.y * 1.14, 0.22),
      Math.max(nativeScreenSize.z, 0.01)
    );

    const plane = resolvePhoneScreenPlane(
      nativeScreen,
      new Vector3(OfficeSeatCameraTarget.x, OfficeSeatCameraTarget.y, OfficeSeatCameraTarget.z)
    );

    if (plane) {
      console.log('[PhoneLoader] CSS3D phone path active');
      console.log('[PhoneLoader] nativeScreen=%s width=%f height=%f normal=[%s]', nativeScreen.name, plane.width, plane.height, formatVector(plane.normalAxis));
      console.log(
        '[PhoneLoader] parent=%s worldBoxSize=[%s] localGeometrySize=[%s] worldQuaternion=[%s] widthAxis=[%s] heightAxis=[%s]',
        nativeScreen.parent?.name ?? '(no parent)',
        formatVector(nativeScreenBounds.getSize(new Vector3())),
        formatVector(plane.localSize ?? new Vector3()),
        formatQuaternion(plane.worldQuaternion ?? nativeScreen.getWorldQuaternion(new Quaternion())),
        formatVector(plane.widthAxis),
        formatVector(plane.heightAxis)
      );

      if (context.debug) {
        logPhoneSurfaceDebug(nativeScreen, plane);

        const debugPlane = new Mesh(
          new PlaneGeometry(
            Math.max(0.08, plane.width),
            Math.max(0.12, plane.height)
          ),
          new MeshBasicMaterial({
            color: 0x5be7ff,
            transparent: true,
            opacity: 0.18,
            side: DoubleSide,
            depthWrite: false,
          })
        );
        debugPlane.name = PhoneDebugPlaneName;
        debugPlane.position.copy(
          plane.planeCenter.clone().add(plane.normalAxis.clone().multiplyScalar(0.003))
        );
        debugPlane.quaternion.copy(plane.rotation);
        debugPlane.userData[AssetKeys.CameraCollidable] = false;
        scene.add(debugPlane);

        const debugAxes = new AxesHelper(Math.max(plane.width, plane.height) * 0.6);
        debugAxes.name = PhoneDebugAxesName;
        debugAxes.position.copy(
          plane.planeCenter.clone().add(plane.normalAxis.clone().multiplyScalar(0.006))
        );
        debugAxes.quaternion.copy(plane.rotation);
        debugAxes.userData[AssetKeys.CameraCollidable] = false;
        scene.add(debugAxes);
      }

      nativeScreen.visible = false;

      let screenWidth = plane.width;
      let screenHeight = plane.height;
      const screenRotation = plane.rotation.clone();

      if (screenWidth > screenHeight) {
        [screenWidth, screenHeight] = [screenHeight, screenWidth];
        screenRotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2));
      }

      screenWidth *= PhoneScreenInsetX;
      screenHeight *= PhoneScreenInsetY;

      const pageWidth = 430;
      const pageHeight = Math.max(780, Math.round(pageWidth * (screenHeight / Math.max(screenWidth, 0.001))));
      const overscan = 1.012;
      const calibratedCenter = plane.planeCenter.clone().add(
        plane.normalAxis.clone().multiplyScalar(PhoneScreenNormalOffset)
      );
      const screenPosition = plane.planeCenter.clone().add(plane.normalAxis.clone().multiplyScalar(PhoneCutoutNormalOffset));
      const cssScreenPosition = calibratedCenter.clone();

      const container = document.createElement('div');
      container.style.width = `${pageWidth}px`;
      container.style.height = `${pageHeight}px`;
      container.style.background = context.debug ? 'red' : '#000';
      container.style.overflow = 'hidden';
      container.style.borderRadius = '32px';
      container.style.pointerEvents = 'auto';
      container.style.outline = context.debug ? '12px solid lime' : 'none';

      const iframe = document.createElement('iframe');
      iframe.id = 'phone-screen-iframe';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      iframe.style.display = 'block';
      iframe.style.backgroundColor = '#000';
      iframe.style.pointerEvents = 'auto';
      iframe.style.opacity = context.debug ? '0.85' : '1';
      iframe.loading = 'lazy';
      const activatePhoneIframe = () => {
        if (shouldDisablePhoneIframe()) {
          console.info('[PhoneLoader] phone iframe disabled by perf flag');
          return;
        }

        if (iframe.src) {
          return;
        }

        iframe.src = getPhoneShellUrl();
        console.info('[PhoneLoader] lazily loaded phone-screen-iframe:', iframe.src);
      };

      if (shouldDisablePhoneIframe()) {
        console.info('[PhoneLoader] phone iframe disabled by perf flag');
      } else {
        console.info('[PhoneLoader] deferring phone-screen-iframe load until PhoneView activation');
      }
      container.appendChild(iframe);
      scene.userData[ActivatePhoneIframeUserDataKey] = activatePhoneIframe;
      console.info('[PhoneLoader] created phone-screen-iframe shell');

      const cssPage = new CSS3DObject(container);
      cssPage.name = PhoneScreenCssName;
      cssPage.position.copy(cssScreenPosition);
      cssPage.quaternion.copy(screenRotation);
      cssPage.scale.set(
        (screenWidth / pageWidth) * overscan,
        (screenHeight / pageHeight) * overscan,
        1
      );

      const phoneScreenMatte = new Mesh(
        new PlaneGeometry(screenWidth * 1.02, screenHeight * 1.024),
        new MeshBasicMaterial({ color: 0x04080f, side: DoubleSide })
      );
      phoneScreenMatte.name = PhoneScreenMatteName;
      phoneScreenMatte.position.copy(
        plane.planeCenter.clone().add(plane.normalAxis.clone().multiplyScalar(-0.004))
      );
      phoneScreenMatte.quaternion.copy(screenRotation);
      phoneScreenMatte.userData[AssetKeys.CameraCollidable] = false;

      const cutoutMaterial = new MeshBasicMaterial({
        color: context.debug ? 0xffea00 : 0x000000,
        side: DoubleSide,
        transparent: context.debug,
        opacity: context.debug ? 0.45 : 1,
      });
      if (!context.debug) {
        cutoutMaterial.colorWrite = false;
      }
      cutoutMaterial.depthWrite = true;

      const cutoutSurface = new Mesh(
        new PlaneGeometry(
          Math.max(0.08, screenWidth),
          Math.max(0.12, screenHeight)
        ),
        cutoutMaterial
      );
      cutoutSurface.name = PhoneScreenSurfaceName;
      cutoutSurface.position.copy(screenPosition);
      cutoutSurface.quaternion.copy(screenRotation);
      cutoutSurface.userData[AssetKeys.CameraCollidable] = false;

      const hotspot = new Mesh(
        new PlaneGeometry(
          Math.max(0.1, screenWidth * 1.05),
          Math.max(0.16, screenHeight * 1.06)
        ),
        new MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          side: DoubleSide,
        })
      );
      hotspot.name = PhoneInteractionZoneName;
      hotspot.position.copy(
        plane.planeCenter.clone().add(plane.normalAxis.clone().multiplyScalar(PhoneHotspotNormalOffset))
      );
      hotspot.quaternion.copy(screenRotation);
      hotspot.material.colorWrite = false;
      hotspot.userData[AssetKeys.CameraCollidable] = false;
      hotspot.userData.phoneCameraTarget = calibratedCenter.toArray();

      const phoneCameraVector = plane.normalAxis
        .clone()
        .add(new Vector3(0, 1, 0).multiplyScalar(0.35))
        .normalize();

      if (phoneCameraVector.y < 0.18) {
        phoneCameraVector.y = 0.18;
        phoneCameraVector.normalize();
      }

      hotspot.userData.phoneCameraVector = phoneCameraVector.toArray();
      hotspot.userData.phoneCameraZoom = 2.8;

      const phoneScreenGlow = new PointLight(0x67c8ff, 1.4, 1.1, 2.2);
      phoneScreenGlow.name = PhoneScreenGlowName;
      phoneScreenGlow.position.copy(
        plane.planeCenter.clone().add(plane.normalAxis.clone().multiplyScalar(0.06))
      );
      phoneScreenGlow.userData[AssetKeys.CameraCollidable] = false;

      cssScene.add(cssPage);
      cutoutScene.add(cutoutSurface);
      scene.add(phoneScreenMatte);
      scene.add(hotspot);
      scene.add(phoneScreenGlow);

      return null;
    }

    scene.userData[PhoneOverlayFallbackUserDataKey] = true;
    console.warn(`[PhoneLoader] could not resolve phone screen plane for ${nativeScreen.name}, falling back to fullscreen overlay`);

    const hotspot = new Mesh(
      new BoxGeometry(
        Math.max(hotspotSize.x, 0.16),
        Math.max(hotspotSize.y, 0.28),
        Math.max(hotspotSize.z, 0.12)
      ),
      new MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: DoubleSide,
      })
    );
    hotspot.name = PhoneInteractionZoneName;
    hotspot.position.copy(hotspotCenter);
    hotspot.material.colorWrite = false;
    hotspot.userData[AssetKeys.CameraCollidable] = false;
    scene.add(hotspot);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}
