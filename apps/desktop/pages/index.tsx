import Head from 'next/head'
import Script from 'next/script'
import styles from '@/styles/Home.module.css'
import { Analytics } from '@vercel/analytics/react';
import { OperatingSystem } from '@/components/OperatingSystem'
import { publicPath } from '@/util/publicPath';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(
        'en', 
        ['common'],
        null,
        ['en']
      )),
      // Will be passed to the page component as props
    },
  }
}

export default function Home() {
  return (
    <>
      <Head>
        <title>OSDC Desktop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0" />
        <link rel="icon" href={publicPath('/favicon.ico')} />
      </Head>
      <main className={styles.main}>
        <Script strategy="beforeInteractive" src={`${publicPath('/emulators/emulators.js')}?v=${Date.now()}`}/>
        <Script strategy="beforeInteractive" src={`${publicPath('/emulators-ui/emulators-ui.js')}?v=${Date.now()}`}/>
        
        <OperatingSystem/>

        <Analytics/>
      </main>
    </>
  )
}
