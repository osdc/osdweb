import { Box3, Spherical, Vector3 } from "three";
import { degToRad, lerp } from "three/src/math/MathUtils";
import { CameraHandler, CameraHandlerContext } from "../CameraHandler";
import { CameraState } from "../CameraState";
import { UserInteractionEvent } from "@/events/UserInteractionEvents";
import { blurDesktop, focusPhoneScreen, getPhoneInteractionZone } from "./util";

export const PHONE_VIEW_TRANSITION_MS = 700;

export class PhoneViewCameraState extends CameraState {
  transition(): void {
    const phoneInteractionZone = getPhoneInteractionZone(this.ctx.scene);
    if (!phoneInteractionZone) { return; }

    const box = new Box3().setFromObject(phoneInteractionZone);
    const fallbackTarget = box.getCenter(new Vector3());
    const target = Array.isArray(phoneInteractionZone.userData.phoneCameraTarget)
      ? new Vector3().fromArray(phoneInteractionZone.userData.phoneCameraTarget)
      : fallbackTarget;

    const fallbackCameraVector = new Vector3(0, 0.45, 1).normalize();
    const cameraVector = Array.isArray(phoneInteractionZone.userData.phoneCameraVector)
      ? new Vector3().fromArray(phoneInteractionZone.userData.phoneCameraVector).normalize()
      : fallbackCameraVector;

    const rotation = new Spherical().setFromVector3(cameraVector);

    if (!Array.isArray(phoneInteractionZone.userData.phoneCameraVector)) {
      rotation.phi = 1.18;
      rotation.theta = degToRad(26);
    }

    const zoom = typeof phoneInteractionZone.userData.phoneCameraZoom === 'number'
      ? phoneInteractionZone.userData.phoneCameraZoom
      : 2.8;

    this.ctx.cameraController.enableDamping();
    this.ctx.cameraController.disableCameraFollow();
    this.ctx.cameraController.setMinZoom(1.6);
    this.ctx.cameraController.setMaxZoom(4.0);
    this.ctx.cameraController.setOriginBoundaryX(0.8);
    this.ctx.cameraController.setOriginBoundaryY(0.5);
    this.ctx.cameraController.setOriginBoundaryZ(0.8);
    this.ctx.cameraController.transition(target, rotation, zoom, PHONE_VIEW_TRANSITION_MS, lerp, () => {
      this.ctx.disableWebGLPointerEvents();
      this.ctx.setCursor('auto');
      focusPhoneScreen();
    });

    blurDesktop();
  }

  onUserEvent(_: UserInteractionEvent): void {}
}
