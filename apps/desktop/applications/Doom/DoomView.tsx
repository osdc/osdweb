import DosEmulator from "@/components/DosEmulator/DosEmulator";
import { WindowProps } from "@/components/WindowManagement/WindowCompositor";
import { publicPath } from "@/util/publicPath";

export default function DoomApplicationView(props: WindowProps) {
  const { application, args, windowContext } = props;

  return DosEmulator({
    gameLocation: publicPath('/games/doom.jsdos'),
    soundService: application.apis.sound
  });
}
