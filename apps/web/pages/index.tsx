import Head from "next/head";
import { SceneLoader } from "../components";
import { useEffect, useState } from "react";
import { NoScriptWarning } from "@/components/noscript/NoScript";
import CommunityPage from "@/components/CommunityPage";
import { Analytics } from "@vercel/analytics/react"

const MobileBreakpointQuery = "(max-width: 700px)";

export default function Web() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

    return () => {
      if ('removeEventListener' in mediaQuery) {
        mediaQuery.removeEventListener('change', syncViewportMode);
      } else {
        legacyMediaQuery.removeListener?.(syncViewportMode);
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>OSDC — Open Source Developers Community</title>

        <meta name="description" content="Open Source Developers Community at JIIT, Noida" />

        <meta property="og:title" content="OSDC — Open Source Developers Community" />
        <meta property="og:description" content="Open Source Developers Community at JIIT, Noida" />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image"/>
        <meta property="twitter:title" content="OSDC — Open Source Developers Community"/>
        <meta property="twitter:description" content="Open Source Developers Community at JIIT, Noida"/>
        <meta property="og:site_name" content="OSDC"></meta>

        <link rel="icon" type="image/x-icon" href="favicon.ico" />
      </Head>
      <NoScriptWarning />
      {!hasMounted ? (
        <></>
      ) : isMobile ? (
        <CommunityPage />
      ) : (
        <SceneLoader />
      )}
      <Analytics />
    </>
  );
}
