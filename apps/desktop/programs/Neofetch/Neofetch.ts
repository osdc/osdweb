import { Shell } from "@/applications/Terminal/Shell";
import { SystemAPIs } from "@/components/OperatingSystem";
import { ProgramConfig } from "../Programs";
import { greenBright, white } from "ansi-colors";
import { osdcFastfetchLogo } from "osdc-content";

function Fastfetch(shell: Shell, _args: string[], _apis: SystemAPIs): void {
  const entry = (key: string, value: string) => `${greenBright(key.padEnd(11))}${white(value)}`;
  const uptimeMinutes = Math.max(0, Math.floor(performance.now() / 60_000));

  shell.getTerminal().writeResponseLines([
    ...osdcFastfetchLogo.map((line) => greenBright(line)),
    '',
    `${greenBright('osdc')}${white('@')}${greenBright(shell.getHostname())}`,
    white('──────────────────────────────'),
    entry('OS', 'OSDC Desktop'),
    entry('Host', shell.getHostname()),
    entry('Community', 'JIIT, Noida'),
    entry('Shell', 'jsh 0.5'),
    entry('Resolution', `${window.innerWidth}x${window.innerHeight}`),
    entry('Uptime', `${uptimeMinutes} min`),
    entry('Source', 'github.com/osdc'),
    '',
  ]);
}

export class FastfetchConfig implements ProgramConfig {
  public readonly appName = "fastfetch";
  public readonly program = Fastfetch;
}

export class NeofetchConfig implements ProgramConfig {
  public readonly appName = "neofetch";
  public readonly program = Fastfetch;
}

export const fastfetchConfig = new FastfetchConfig();
export const neofetchConfig = new NeofetchConfig();
