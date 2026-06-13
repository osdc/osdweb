import { LocalWindowCompositor } from "@/components/WindowManagement/LocalWindowCompositor";
import { WindowContext } from "@/components/WindowManagement/WindowCompositor";
import { ApplicationEvent } from "../ApplicationEvents";
import { Application, ApplicationConfig, MenuEntry } from "../ApplicationManager";
import { LocalApplicationManager } from "../LocalApplicationManager";
import { SystemAPIs } from "@/components/OperatingSystem";
import dynamic from 'next/dynamic';

const View = dynamic(() => import('./FinderView'));

export class FinderConfig implements ApplicationConfig {
  public readonly displayName = 'Finder';
  public readonly dockPriority = -100;
  public readonly path = '/Applications/';
  public readonly appName = 'Finder.app';
  public readonly appIcon = { src: '/icons/finder-icon.png', alt: 'Finder application' };
  public readonly entrypoint = (
    compositor: LocalWindowCompositor,
    manager: LocalApplicationManager,
    apis: SystemAPIs
  ) => new Finder(compositor, manager, apis);
}

export const finderConfig = new FinderConfig();

export class Finder extends Application {

  config(): ApplicationConfig {
    return finderConfig;
  }

  menuEntries(): MenuEntry[] {
    return [{
      displayOptions: { boldText: true },
      name: 'Finder',
      items: [
        { kind: 'action', value: 'Open window', action: () => this.openNewWindow('/Users/osdc/') },
      ]
    }]
  }

  private openNewWindow(path: string) {
    const width = Math.min(window.innerWidth * 0.72, 720);
    const height = Math.min(window.innerHeight * 0.7, 470);
    const x = Math.max(20, Math.round((window.innerWidth - width) * 0.42));
    const y = Math.max(44, Math.round((window.innerHeight - height) * 0.18));

    const finderWindow = this.compositor.open({
      x,
      y,
      height,
      width,
      title: `Finder`,
      application: this,
      args: path,
      generator: () => { return View; }
    });

    finderWindow.minimalHeight  = 250;
    finderWindow.minimalWidth   = 400;
  }

  on(event: ApplicationEvent, windowContext?: WindowContext): void {
    if (event.kind === 'application-open') {
      const hasExplicitPath = event.args.length !== 0;

      // Do not auto-open a Finder window only for the silent boot instance.
      if (event.isFirst && !hasExplicitPath) { return; }

      const path = hasExplicitPath ? event.args : '/Users/osdc/';
      this.openNewWindow(path);
    };

    if (event.kind === 'finder-open-file-event') {
      if (!windowContext) { return }

      this.manager.open(`"${event.path}"`);
    }
  }
}
