import { SystemAPIs } from "@/components/OperatingSystem"
import { ProgramConfig } from "../Programs"
import { Shell } from "@/applications/Terminal/Shell";

function MessageOfTheDay(shell: Shell, args: string[], apis: SystemAPIs): void {
  shell.getTerminal().writeResponseLines([
    'OSDC desktop shell alpha build, (C)2026 OSDC.',
    'Authorized use only.',
    'All activity is monitored and may be reported.',
    ''
  ]);
}

export class MessageOfTheDayConfig implements ProgramConfig {
  public readonly appName = "motd"
  public readonly program = MessageOfTheDay
}

export const motdConfig = new MessageOfTheDayConfig();
