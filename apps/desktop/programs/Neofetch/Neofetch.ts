import { Shell } from "@/applications/Terminal/Shell";
import { SystemAPIs } from "@/components/OperatingSystem";
import { ProgramConfig } from "../Programs";
import { greenBright, white } from "ansi-colors";

function Neofetch(shell: Shell, args: string[], apis: SystemAPIs): void {
  function entry(key: string, value: string): string {
    return `${greenBright(key)} ${white(value)}`;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const userHostText = `osdc@${shell.getHostname()}`;
  const header = `${greenBright("osdc")}${white("@")}${greenBright(shell.getHostname())}`;
  const logo = [
    "+--------------------------------------+",
    "|   ____   _____  _____   _____       |",
    "|  / __ \\ / ____||  __ \\ / ____|      |",
    "| | |  | | (___  | |  | | |           |",
    "| | |  | |\\___ \\ | |  | | |           |",
    "| | |__| |____) || |__| | |____       |",
    "|  \\____/|_____/ |_____/ \\_____|      |",
    "+--------------------------------------+",
  ];
  const details = [
    header,
    white("=".repeat(userHostText.length)),
    entry("OS:", "OSDC Desktop 1.0.0"),
    entry("Host:", shell.getHostname()),
    entry("Kernel:", "1.0.0"),
    entry("Uptime:", "A long time"),
    entry("Shell:", "jsh 0.5"),
    entry("Resolution:", `${width}x${height}`),
  ];
  const logoWidth = logo.reduce((max, line) => Math.max(max, line.length), 0);
  const totalLines = Math.max(logo.length, details.length);
  const responseLines = Array.from({ length: totalLines }, (_, index) => {
    const left = logo[index] ?? "";
    const right = details[index] ?? "";

    if (!right) {
      return white(left);
    }

    return `${white(left.padEnd(logoWidth))}  ${right}`;
  });

  shell.getTerminal().writeResponseLines(responseLines);
}

export class NeofetchConfig implements ProgramConfig {
  public readonly appName = "neofetch"
  public readonly program = Neofetch
}

export const neofetchConfig = new NeofetchConfig();
