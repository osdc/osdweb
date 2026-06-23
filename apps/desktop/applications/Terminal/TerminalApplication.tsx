import { LocalWindowCompositor } from "@/components/WindowManagement/LocalWindowCompositor";
import { WindowContext } from "@/components/WindowManagement/WindowCompositor";
import { ApplicationEvent } from "../ApplicationEvents";
import { Application, ApplicationConfig, MenuEntry } from "../ApplicationManager";
import { LocalApplicationManager } from "../LocalApplicationManager";
import dynamic from 'next/dynamic';
import { SystemAPIs } from "@/components/OperatingSystem";

const View = dynamic(() => import('./TerminalApplicationView'), {
  ssr: false,
});

export class TerminalConfig implements ApplicationConfig {
  public readonly displayName = 'Terminal';
  public readonly dockPriority = null;
  public readonly path = '/Applications/';
  public readonly appName = 'Terminal.app';
  public readonly appIcon = { src: '/icons/terminal-icon.png', alt: 'Terminal' };
  public readonly entrypoint = (
    compositor: LocalWindowCompositor,
    manager: LocalApplicationManager,
    apis: SystemAPIs
  ) => new TerminalApplication(compositor, manager, apis);
}

export const terminalConfig = new TerminalConfig();

export class TerminalApplication extends Application {

  config(): ApplicationConfig {
    return terminalConfig;
  }

  menuEntries(): MenuEntry[] {
    return [{
      displayOptions: { boldText: true },
      name: 'Terminal',
      items: []
    }]
  }

  on(event: ApplicationEvent, windowContext?: WindowContext): void {
    this.baseHandler(event, windowContext);

    if (event.kind === 'application-open') {
      const width = Math.min(window.innerWidth * 0.7, 640);
      const height = Math.min(window.innerHeight * 0.68, 420);
      const x = Math.max(24, Math.round((window.innerWidth - width) * 0.5));
      const y = Math.max(54, Math.round((window.innerHeight - height) * 0.2));

      this.compositor.open({
        x,
        y,
        height,
        width,
        title: `Terminal`,
        application: this,
        args: event.args,
        generator: () => { return View; }
      });
    };
  }
}
