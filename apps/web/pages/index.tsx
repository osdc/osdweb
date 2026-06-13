import Head from "next/head";
import { SceneLoader } from "../components";
import { useEffect, useState } from "react";
import { NoScriptWarning } from "@/components/noscript/NoScript";
import { Analytics } from "@vercel/analytics/react"

const focusedTitle = "OSDC - Interactive Hub";
const blurredTitle = "👀 OSDC - Interactive Hub";

export default function Web() {
  const [title, setTitle] = useState("OSDC - Interactive Hub");

  function onVisibilityChange() {
    const title = document.visibilityState === 'visible' ? focusedTitle : blurredTitle;

    setTitle(title);
  }

  useEffect(() => {
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
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
      <SceneLoader />
      <Analytics />
    </>
  );
}
