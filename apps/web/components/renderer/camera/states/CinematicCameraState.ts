import { MouseData, PointerCoordinates, TouchData, UserInteractionEvent } from "@/events/UserInteractionEvents";
import { UpdatableCameraState } from "../CameraState";
import { CameraHandler, CameraHandlerContext, CameraHandlerState } from "../CameraHandler";
import { SceneInteractionTarget, calculateCameraPosition, clickedDOMButton, constructGetInteractionTarget, easeInOutSine, getDisplay, openPhoneOverlay, openPhotoFrameDestination } from "./util";
import { degToRad } from "three/src/math/MathUtils";
import { Mesh, Spherical, Vector3 } from "three";
import { easeOutCubicErp } from "../util";
import { CameraController } from "../Camera";
import { OfficeSeatCameraTarget } from "@/components/scene-loader/AssetLoaders";

function createOverviewCamera(display: Mesh, fov: number) {
  const { position, spherical, distance } = calculateCameraPosition(display, fov, 2.9);
  const rotation = spherical.clone();

  rotation.phi = Math.max(0.98, spherical.phi + 0.06);

  return {
    position,
    rotation,
    baseTheta: spherical.theta,
    zoom: Math.max(distance * 2.45, 6.3),
  };
}

export function setInitialCameraPosition(cameraController: CameraController, display?: Mesh) {
  if (!display) {
    cameraController.setPanOffsetX(OfficeSeatCameraTarget.x);
    cameraController.setPanOffsetY(OfficeSeatCameraTarget.y);
    cameraController.setPanOffsetZ(OfficeSeatCameraTarget.z + 2.1);
    cameraController.update(0);
    return;
  }

  const overview = createOverviewCamera(display, cameraController.getCamera().fov);

  cameraController.setPanOffsetX(overview.position.x);
  cameraController.setPanOffsetY(overview.position.y);
  cameraController.setPanOffsetZ(overview.position.z);
  cameraController.setRotationTheta(overview.baseTheta + degToRad(-3.5));
  cameraController.setRotationPhi(overview.rotation.phi);
  cameraController.setZoom(overview.zoom);
  cameraController.update(0);
}

export class CinematicCameraState extends UpdatableCameraState {

  private cameraRotationSpeed = 3.2;
  private overviewBaseTheta = 0;

  private initialTransitionMs = 0;
  private otherTransitionsMs = 680;

  private getInteractionTarget: ReturnType<typeof constructGetInteractionTarget>;

  private progress: number = 0;
  private previousTarget: SceneInteractionTarget = null;

  constructor(manager: CameraHandler, ctx: CameraHandlerContext) {
    super(manager, ctx);

    this.getInteractionTarget = constructGetInteractionTarget(this.ctx);
  }

  transition(): void {
    const display = getDisplay(this.ctx.scene);
    if (!display) { return; }

    const overview = createOverviewCamera(display, this.ctx.cameraController.getCamera().fov);
    this.overviewBaseTheta = overview.baseTheta;

    const position = overview.position.clone();
    const rotation = overview.rotation.clone();
    rotation.theta = this.calculateRotation(0);
    const zoom = overview.zoom;

    if (this.ctx.isInitialScene()) {
      cameraControllerSeed(this.ctx.cameraController, position, rotation, zoom);
    }

    const delay = this.ctx.isInitialScene() ? this.initialTransitionMs : this.otherTransitionsMs;

    this.ctx.cameraController.transition(position, rotation, zoom, delay, easeOutCubicErp, () => {
      this.progress = 0;
    });

    this.ctx.setCursor('pointer');
  }

  private calculateRotation(progress: number): number {
    progress %= 100;

    const min = this.overviewBaseTheta + degToRad(-3.5);
    const max = this.overviewBaseTheta + degToRad(3.5);

    const moveToRight = progress < 50;
    const t = moveToRight ? progress / 50 : (progress - 50) / 50;
    const ease = easeInOutSine(t);

    const delta = max - min;

    if (moveToRight) {
      return min + (delta * ease);
    } else {
      return max - (delta * ease);
    }
  }

  update(deltaTime: number): void {
    if (this.previousTarget !== null) {
      return;
    }

    this.progress += this.cameraRotationSpeed * deltaTime;

    this.ctx.cameraController.setRotationTheta(this.calculateRotation(this.progress));

    this.progress %= 100;
  }

  onUserEvent(data: UserInteractionEvent): void {
    switch (data.event) {
      case 'mouse_event': return this.handleMouseEvent(data.data);
      case 'touch_event': return this.handleTouchEvent(data.data);
    }
  }

  private handleMouseClickEvent(data: MouseData): void {
    if (!data.isPrimaryDown()) { return; }
    if (clickedDOMButton(true, data.x, data.y)) { return; }
    
    const target = this.getInteractionTarget(data) ?? this.previousTarget;

    if (target === 'display') {
      this.manager.changeState(CameraHandlerState.MonitorView);
      return;
    }

    if (target === 'phone') {
      if (!openPhoneOverlay(this.ctx.scene)) {
        this.manager.changeState(CameraHandlerState.PhoneView);
      }
      return;
    }

    if (target === 'frame') {
      openPhotoFrameDestination();
      return;
    }

    this.manager.changeState(CameraHandlerState.FreeRoam);
  }

  private handleMouseEvent(data: MouseData) {
    const target = this.getInteractionTarget(data);
    this.previousTarget = target;
    this.ctx.setCursor(target ? 'pointer' : 'grab');
    this.handleMouseClickEvent(data);
  }

  private handleTouchStartEvents(data: TouchData) {
    const coords = data.pointerCoordinates();
    if (clickedDOMButton(data.hasTouchesDown(1), coords.x, coords.y)) { return; }
    
    const target = this.getInteractionTarget(coords);

    if (target === 'display') {
      this.manager.changeState(CameraHandlerState.MonitorView);
      return;
    }

    if (target === 'phone') {
      if (!openPhoneOverlay(this.ctx.scene)) {
        this.manager.changeState(CameraHandlerState.PhoneView);
      }
      return;
    }

    if (target === 'frame') {
      openPhotoFrameDestination();
      return;
    }

    this.manager.changeState(CameraHandlerState.FreeRoam);
  }

  private handleTouchEvent(data: TouchData) {
    if (data.source === 'start') {
      this.handleTouchStartEvents(data);
    }
  }
}

function cameraControllerSeed(
  cameraController: CameraController,
  position: Vector3,
  rotation: Spherical,
  zoom: number
) {
  cameraController.setPanOffsetX(position.x);
  cameraController.setPanOffsetY(position.y);
  cameraController.setPanOffsetZ(position.z);
  cameraController.setRotationTheta(rotation.theta);
  cameraController.setRotationPhi(rotation.phi);
  cameraController.setZoom(zoom);
  cameraController.update(0);
}
