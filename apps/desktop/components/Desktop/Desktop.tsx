import styles from './Desktop.module.css';
import React, { useEffect, useRef, useReducer, useState } from "react";
import { Window, WindowApplication, WindowCompositor } from '../WindowManagement/WindowCompositor';
import { WindowEvent } from '../WindowManagement/WindowEvents';
import dynamic from 'next/dynamic';
import { SystemAPIs } from '../OperatingSystem';
import { FileSystemNode } from '@/apis/FileSystem/FileSystem';
import { ApplicationManager } from '@/applications/ApplicationManager';
import { constructPath } from '@/apis/FileSystem/util';

const FolderView = dynamic(() => import('../Folder/FolderView'));
const WindowContainer = dynamic(() => import('../WindowManagement/WindowContainer'));

interface ApplicationData {
  window: Window,
  application: WindowApplication
}

type DesktopContextMenuState = {
  open: boolean,
  x: number,
  y: number,
};

const applicationReducer = (windowCompositor: WindowCompositor) => {  
  return (state: ApplicationData[], action: WindowEvent) => {
    
    switch (action.event) {
      case 'create_window': { 
        const window = windowCompositor.getById(action.windowId);
        if (!window) { return state; }

        if (state.find(x => x.window.id === window.id)) { break; }

        const application = window.generator();
        const entry = { window, application };
        
        state = [...state, entry];
      }
      break;

      case 'update_window': {
        const window = windowCompositor.getById(action.windowId);
        if (!window) { return state; }

        state = state.map(x => {
          if (x.window.id !== window.id) { return x; }

          x.window = window;

          return x;
        });
      }
      break;

      case 'update_windows': {
        state = state.map(x => {
          const window = windowCompositor.getById(x.window.id);
          if (window === null) {  throw new Error('Attempting to update a window that doesn\'t exist') }

          x.window = window;
          return x;
        });
      }
      break;

      case 'destroy_window':
        state = state.filter(x => x.window.id !== action.windowId);
      break;
    }
    
    return state;
  }
};

export const Desktop = (props: {
  windowCompositor: WindowCompositor,
  manager: ApplicationManager,
  apis: SystemAPIs,
  monitorMode?: boolean,
  wallpaperUrl?: string | null,
}) => {
  const {
    windowCompositor,
    manager,
    apis,
    monitorMode = false,
    wallpaperUrl = null,
  } = props;

  const desktopNode = useRef<HTMLDivElement>(null);
  const parentNode = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const reducer = applicationReducer(windowCompositor);
  const [applicationWindows, dispatch] = useReducer(reducer, []);
  const [contextMenu, setContextMenu] = useState<DesktopContextMenuState>({ open: false, x: 0, y: 0 });

  function onFileOpen(file: FileSystemNode) {
    const path = constructPath(file);

    manager.open(`"${path}"`);
  }

  function closeContextMenu() {
    setContextMenu({ open: false, x: 0, y: 0 });
  }

  function openTerminal() {
    manager.open('/Applications/Terminal.app');
    closeContextMenu();
  }

  function openFinder() {
    manager.open('/Applications/Finder.app /Users/osdc/Desktop');
    closeContextMenu();
  }

  function openAbout() {
    manager.open('/Applications/About.app');
    closeContextMenu();
  }

  function openContact() {
    manager.open('/Applications/Contact.app');
    closeContextMenu();
  }

  function onContextMenu(evt: React.MouseEvent<HTMLDivElement>) {
    if (!monitorMode || !desktopNode.current) { return; }
    if ((evt.target as HTMLElement).closest('[data-window-root="true"]')) { return; }

    evt.preventDefault();

    const bounds = desktopNode.current.getBoundingClientRect();
    const maxX = Math.max(12, bounds.width - 196);
    const maxY = Math.max(12, bounds.height - 208);

    setContextMenu({
      open: true,
      x: Math.min(Math.max(12, evt.clientX - bounds.left), maxX),
      y: Math.min(Math.max(12, evt.clientY - bounds.top), maxY),
    });
  }

  useEffect(() => {
    const unsubscribe = windowCompositor.subscribe((evt: WindowEvent) => {
      dispatch(evt);
    });

    const desktop = parentNode.current;
    if (!desktop) {
      return () => { unsubscribe(); };
    }

    const syncDesktopSize = () => {
      windowCompositor.setSize(
        desktop.clientWidth,
        desktop.clientHeight
      );
    };

    syncDesktopSize();

    const resizeObserver = new ResizeObserver(syncDesktopSize);
    resizeObserver.observe(desktop);

    return () => {
      resizeObserver.disconnect();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!contextMenu.open) { return; }

    function handlePointerDown(evt: PointerEvent) {
      const target = evt.target as Node | null;
      if (!target) { return; }
      if (contextMenuRef.current?.contains(target)) { return; }

      closeContextMenu();
    }

    function handleEscape(evt: KeyboardEvent) {
      if (evt.key === 'Escape') {
        closeContextMenu();
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu.open]);


  const applications = applicationWindows.map(x => 
    <WindowContainer
      key={x.window.id}
      window={x.window}
      WindowApp={x.application}
      windowCompositor={windowCompositor}
      parent={parentNode.current}
    />
  );

  const desktopStyle =
    monitorMode && wallpaperUrl
      ? {
          backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(4, 10, 18, 0.12)), url("${wallpaperUrl}")`,
          backgroundSize: "100% 100%, cover",
          backgroundPosition: "center center, center center",
          backgroundRepeat: "no-repeat, no-repeat",
        }
      : undefined;

  return (
    <div
      ref={desktopNode}
      className={[styles.desktop, monitorMode ? styles.monitorMode : ""].join(" ").trim()}
      style={desktopStyle}
      onContextMenu={onContextMenu}
    >
      {!monitorMode && (
        <FolderView
          directory='/Users/osdc/Desktop'
          apis={apis}
          onFileOpen={onFileOpen}
          localIconPosition={true}
          allowOverflow={false}
        />
      )}

      {monitorMode && applicationWindows.length === 0 && (
        <div className={styles.monitorEmptyState}>
          <p className={styles.monitorEmptyStateEyebrow}>WORKROOM READY</p>
          <h2 className={styles.monitorEmptyStateTitle}>Launch a tool from the outer monitor shell.</h2>
          <p className={styles.monitorEmptyStateCopy}>
            Finder, Notes, Terminal, Algorithms, Doom, and the club stack will open here
            without spawning a second desktop shell.
          </p>
        </div>
      )}

      <div
        ref={parentNode}
        className={[
          styles.applicationContainer,
          monitorMode ? styles.monitorApplicationContainer : "",
        ].join(" ").trim()}
      >
        {applications}
      </div>

      {monitorMode && contextMenu.open && (
        <div
          ref={contextMenuRef}
          className={styles.desktopContextMenu}
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          <button className={styles.desktopContextItem} onClick={openTerminal}>Open Terminal</button>
          <button className={styles.desktopContextItem} onClick={openFinder}>Open Finder</button>
          <button className={styles.desktopContextItem} onClick={openAbout}>About OSDC</button>
          <button className={styles.desktopContextItem} onClick={openContact}>Contact</button>
          <div className={styles.desktopContextDivider}></div>
          <button className={styles.desktopContextItem} onClick={closeContextMenu}>Close Menu</button>
        </div>
      )}
    </div>
  )
}
