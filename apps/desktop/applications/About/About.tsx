import { LocalWindowCompositor } from "@/components/WindowManagement/LocalWindowCompositor";
import { WindowContext, Window } from "@/components/WindowManagement/WindowCompositor";
import { ApplicationEvent, ApplicationOpenEvent } from "../ApplicationEvents";
import { Application, ApplicationConfig, MenuEntry } from "../ApplicationManager";
import { LocalApplicationManager } from "../LocalApplicationManager";
import dynamic from 'next/dynamic';
import { SystemAPIs } from "@/components/OperatingSystem";

const View = dynamic(() => import('./AboutView'));

export class AboutConfig implements ApplicationConfig {
  public readonly displayName = 'OSDC';
  public readonly dockPriority = null;
  public readonly path = '/Applications/';
  public readonly appName = 'About.app';
  public readonly appIcon = { src: '/icons/about-app.png', alt: 'OSDC' };
  public readonly entrypoint = (
    compositor: LocalWindowCompositor,
    manager: LocalApplicationManager,
    apis: SystemAPIs
  ) => new AboutApplication(compositor, manager, apis);
}

export const aboutConfig = new AboutConfig();

export class AboutApplication extends Application {
  config(): ApplicationConfig {
    return aboutConfig;
  }

  menuEntries(): MenuEntry[] {
    return [{
      displayOptions: { boldText: true },
      name: 'OSDC',
      items: []
    }]
  }

  private createNewWindow(event: ApplicationOpenEvent): Window {
    const dockReserve = 82;
    const marginX = 28;
    const marginTop = 28;
    const marginBottom = 18;
    const rightIconLane = window.innerWidth >= 1100 ? 96 : 0;

    let width: number;
    let height: number;
    let x: number;
    let y: number;

    if (window.innerWidth < 800) {
      width = Math.max(360, window.innerWidth - 24);
      height = Math.max(360, window.innerHeight - dockReserve - 24);
      x = 12;
      y = 12;
    } else {
      const availableWidth = Math.max(720, window.innerWidth - marginX * 2 - rightIconLane);
      const availableHeight = Math.max(480, window.innerHeight - dockReserve - marginTop - marginBottom);

      width = Math.max(720, Math.min(availableWidth, Math.round(window.innerWidth * 0.9)));
      height = Math.max(480, availableHeight);
      x = marginX;
      y = marginTop;
    }

    return this.compositor.open({
      x, y,
      height,
      width,
      title: "OSDC",
      application: this,
      args: event.args,
      generator: () => { return View; }
    });
  }

  on(event: ApplicationEvent, windowContext?: WindowContext): void {
    this.baseHandler(event, windowContext);

    if (event.kind === 'about-open-contact-event') {
      this.manager.open('/Applications/Contact.app');
    }

    if (event.kind === 'application-open') {
      this.createNewWindow(event);
    };

    if (event.kind === 'application-quit') {
      if (!windowContext) { return; }
    }
  }
}
