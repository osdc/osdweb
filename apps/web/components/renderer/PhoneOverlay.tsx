import { PhoneClubbook } from "./PhoneClubbook";

type PhoneOverlayProps = {
  open: boolean,
  onClose: () => void,
  immersive?: boolean,
};

export function PhoneOverlay(props: PhoneOverlayProps) {
  return (
    <PhoneClubbook
      mode="overlay"
      open={props.open}
      onClose={props.onClose}
      immersive={props.immersive}
    />
  );
}
