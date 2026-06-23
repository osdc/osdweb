import { Spherical, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { CameraHandler, CameraHandlerContext, CameraHandlerState } from "../CameraHandler";
import { CameraState } from "../CameraState";
import { PanOriginData, SceneInteractionTarget, blurDesktop, calculateCameraPosition, constructGetInteractionTarget, getDisplay, isMouseMoveCamera, isMouseRotateCamera, isTouchMoveCamera, isTouchRotateCamera, isTouchTap, isTouchZoom, openPhotoFrameDestination } from "./util";
import { MouseData, PointerCoordinates, ConfirmationData, TouchData, UserInteractionEvent, toUserInteractionTouchConfirmationEvent, toUserInteractionMouseConfirmationEvent, MouseInstructionData, cancelUserInteractionMouseConfirmationEvent } from "@/events/UserInteractionEvents";
import { OfficeSeatCameraTarget } from "@/components/scene-loader/AssetLoaders";

export class FreeRoamCameraState extends CameraState {

  private previousMovementData: PointerCoordinates | null = null;
  private previousRotationData: PointerCoordinates | null = null;

  private panOrigin: PanOriginData | null = null;

  private getInteractionTarget: ReturnType<typeof constructGetInteractionTarget>;
  private previousInteractionTarget: SceneInteractionTarget = null;

  constructor(manager: CameraHandler, ctx: CameraHandlerContext) {
    super(manager, ctx);

    this.getInteractionTarget = constructGetInteractionTarget(this.ctx);
  }

  transition(): void {
    this.ctx.enableWebGLPointerEvents();

    const display = getDisplay(this.ctx.scene);
    const overview = display
      ? calculateCameraPosition(display, this.ctx.cameraController.getCamera().fov, 2.9)
      : null;

    const position = overview?.position.clone() ?? new Vector3(
      OfficeSeatCameraTarget.x,
      OfficeSeatCameraTarget.y,
      OfficeSeatCameraTarget.z
    );

    const rotation = overview?.spherical.clone() ?? new Spherical();
    rotation.phi = Math.max(1.0, rotation.phi + 0.08);

    const zoom = overview ? Math.max(overview.distance * 2.55, 6.5) : 7.1;

    this.ctx.cameraController.enableDamping();
    this.ctx.cameraController.disableCameraFollow();

    this.ctx.cameraController.setMinZoom(2.8);
    this.ctx.cameraController.setMaxZoom(12.5);

    this.ctx.cameraController.setOriginBoundaryX(7.5);
    this.ctx.cameraController.setOriginBoundaryY(4.5);
    this.ctx.cameraController.setOriginBoundaryZ(7.5);

    this.ctx.cameraController.transition(position, rotation, zoom, 620);

    blurDesktop();
  }

  private handleDisplayClick(data: PointerCoordinates): void {
    const target = this.getInteractionTarget(data) ?? this.previousInteractionTarget;

    if (target === null) { return; }

    this.clearMouseInstruction();

    if (target === 'display') {
      this.manager.changeState(CameraHandlerState.MonitorView);
      return;
    }

    if (target === 'frame') {
      openPhotoFrameDestination();
      return;
    }

    this.manager.changeState(CameraHandlerState.PhoneView);
  }

  private moveCamera(coords: PointerCoordinates): void {
    const sensitivity = 0.005;

    let forward = 0;
    let left = 0;

    const previous = this.previousMovementData;

    if (previous !== null) {
      forward = (coords.y - previous.y) * sensitivity;
      left = (coords.x - previous.x) * sensitivity;
    }

    this.ctx.cameraController.moveCameraForward(forward);
    this.ctx.cameraController.moveCameraLeft(left);

    this.previousMovementData = coords;
  }

  private clearMoveCamera(): void {
    this.previousMovementData = null;
  }

  private rotateCamera(coords: PointerCoordinates): void {
    const sensitivity = 0.01;

    let phi = 0;
    let theta = 0;

    const previous = this.previousRotationData;

    if (previous !== null) {
      phi = (coords.y - previous.y) * sensitivity;
      theta = (coords.x - previous.x) * sensitivity;
    }

    this.ctx.cameraController.rotateCamera(phi, theta);

    this.previousRotationData = coords;
  }

  private updateCursor(data: PointerCoordinates): void {
    const ctx = this.ctx;

    ctx.setCursor(this.getInteractionTarget(data) ? 'pointer' : 'grab');
  }

  private clearRotateCamera(): void {
    this.previousRotationData = null;
  }

  onUserEvent(data: UserInteractionEvent): void {
    switch (data.event) {
      case 'mouse_event': return this.handleMouseEvent(data.data);
      case 'touch_event': return this.handleTouchEvent(data.data);
    }
  }

  private handleMouseUp(data: MouseData): void {
    this.clearMoveCamera();
    this.clearRotateCamera();
  }

  private handleMouseDown(data: MouseData): void {
    if (data.isPrimaryDown()) {
      this.handleDisplayClick(data);
    }
  }

  private clearMouseInstruction(): void {
    const cancelEvent = cancelUserInteractionMouseConfirmationEvent();
    this.manager.emitUserInteractionEvent(cancelEvent);
  }

  private handleMouseInstruction(data: MouseData): void {
    const target = this.getInteractionTarget(data);
    const hasChangedInteractionTarget = (): boolean => target !== this.previousInteractionTarget;

    if (hasChangedInteractionTarget()) {
      if (target === 'display') {
        const confirmEvent = toUserInteractionMouseConfirmationEvent(MouseInstructionData.fromMouseData(data, 'Click to open desktop'));
        this.manager.emitUserInteractionEvent(confirmEvent);
      } else if (target === 'frame') {
        const confirmEvent = toUserInteractionMouseConfirmationEvent(MouseInstructionData.fromMouseData(data, 'Open OSDHack'));
        this.manager.emitUserInteractionEvent(confirmEvent);
      } else if (target === 'phone') {
        const confirmEvent = toUserInteractionMouseConfirmationEvent(MouseInstructionData.fromMouseData(data, 'Click to open pocket mode'));
        this.manager.emitUserInteractionEvent(confirmEvent);
      } else {
        this.clearMouseInstruction();
      }
    }

    this.previousInteractionTarget = target;
  }

  private handleMouseMove(data: MouseData): void {
    if (isMouseRotateCamera(data)) { this.rotateCamera(data.pointerCoordinates()); }
    if (isMouseMoveCamera(data)) { this.moveCamera(data.pointerCoordinates()); }

    this.handleMouseInstruction(data);
    this.updateCursor(data);
  }

  private handleMouseScroll(data: MouseData): void {
    this.ctx.cameraController.zoom(data.zoomDelta());
  }

  private handleMouseEvent(data: MouseData) {
    switch (data.source) {
      case 'up': return this.handleMouseUp(data);
      case 'down': return this.handleMouseDown(data);
      case 'move': return this.handleMouseMove(data);
      case 'wheel': return this.handleMouseScroll(data);
    }
  }

  private setupZoomEvent(data: TouchData) {
    if (isTouchZoom(data)) {
      this.panOrigin = PanOriginData.create(this.ctx.cameraController, data);
    } else {
      this.panOrigin = null;
    }
  }

  private handleZoomEvent(data: TouchData) {
    if (this.panOrigin === null) { return; }

    const origin = this.panOrigin.touchData;
    const bb1 = origin.boundingBox();
    const bb2 = data.boundingBox();

    const zoomDistance = this.panOrigin.zoomDistance;
    const zoomOffset = (bb2.diagonal() - bb1.diagonal()) * 0.01;

    this.ctx.cameraController.setZoom(zoomDistance - zoomOffset);
  }

  private handleTouchDisplayClick(data: TouchData) {
    const target = this.getInteractionTarget(data.pointerCoordinates());
    if (target === null) { return; }

    const onSuccess = () => {
      this.clearMouseInstruction();

      if (target === 'display') {
        this.manager.changeState(CameraHandlerState.MonitorView);
        return;
      }

      if (target === 'frame') {
        openPhotoFrameDestination();
        return;
      }

      this.manager.changeState(CameraHandlerState.PhoneView);
    };

    const confirm = ConfirmationData.fromTouchData(
      data,
      800,
      onSuccess,
      null,
    );

    const confirmEvent = toUserInteractionTouchConfirmationEvent(confirm);

    this.manager.emitUserInteractionEvent(confirmEvent);
  }

  private handleTouchStart(data: TouchData) {
    if (isTouchTap(data)) {
      this.handleTouchDisplayClick(data);
    }

    this.setupZoomEvent(data);
    this.clearMoveCamera();
    this.clearRotateCamera();
  }

  private handleTouchMove(data: TouchData) {
    if (isTouchMoveCamera(data)) { this.moveCamera(data.pointerCoordinates()); }
    if (isTouchRotateCamera(data)) { this.rotateCamera(data.pointerCoordinates()); }
    if (isTouchZoom(data)) { this.handleZoomEvent(data); }
  }

  private handleTouchEnd(data: TouchData) {
    this.clearMoveCamera();
    this.clearRotateCamera();
  }

  private handleTouchEvent(data: TouchData) {
    switch (data.source) {
      case "start": return this.handleTouchStart(data);
      case "move": return this.handleTouchMove(data);
      case "end": return this.handleTouchEnd(data);
    }
  }
}
