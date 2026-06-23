import Head from "next/head";
import { SceneLoader } from "../components";
import { useEffect, useState } from "react";
import { NoScriptWarning } from "@/components/noscript/NoScript";
import { PhoneClubbook } from "@/components/renderer/PhoneClubbook";
import { Analytics } from "@vercel/analytics/react"

const focusedTitle = "OSDC - Interactive Hub";
const blurredTitle = "👀 OSDC - Interactive Hub";
const MobileBreakpointQuery = "(max-width: 700px)";

export default function Web() {
  const [title, setTitle] = useState("OSDC - Interactive Hub");
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [force3D, setForce3D] = useState(false);

  function onVisibilityChange() {
    const title = document.visibilityState === 'visible' ? focusedTitle : blurredTitle;

    setTitle(title);
  }

  useEffect(() => {
    setHasMounted(true);
    const mediaQuery = window.matchMedia(MobileBreakpointQuery);
    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void,
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void,
    };

    const syncViewportMode = () => {
      setIsMobile(mediaQuery.matches);
    };

    syncViewportMode();

    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', syncViewportMode);
    } else {
      legacyMediaQuery.addListener?.(syncViewportMode);
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if ('removeEventListener' in mediaQuery) {
        mediaQuery.removeEventListener('change', syncViewportMode);
      } else {
        legacyMediaQuery.removeListener?.(syncViewportMode);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>

        <meta name="description" content="Interactive hub for the Open Source Developers Community" />

        <meta property="og:title" content="OSDC - Interactive Hub" />
        <meta property="og:description" content="Interactive hub for the Open Source Developers Community" />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image"/>
        <meta property="twitter:title" content="OSDC - Interactive Hub"/>
        <meta property="twitter:description" content="Interactive hub for the Open Source Developers Community"/>
        <meta property="og:site_name" content="OSDC"></meta>

        <link rel="icon" type="image/x-icon" href="favicon.ico" />
      </Head>
      <NoScriptWarning />
      {!hasMounted ? (
        <></>
      ) : isMobile && !force3D ? (
        <PhoneClubbook mode="embedded" onEnterDesk={() => setForce3D(true)} />
      ) : (
        <SceneLoader />
      )}
      <Analytics />
    </>
  );
}
