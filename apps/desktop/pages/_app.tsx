import '@/styles/globals.css'
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app'
import { publicPath } from '@/util/publicPath';

const desktopGlobalAssetCss = `
  :root {
    --desktop-spritesheet-url: url('${publicPath('/icons/icon-spritesheet.png')}');
  }

  @font-face {
    font-family: 'Century Schoolbook';
    font-style: sans-serif;
    font-weight: normal;
    src: local('Century Schoolbook'), url('${publicPath('/fonts/century_schoolbook.ttf')}') format('truetype');
  }

  @font-face {
    font-family: 'Noto Serif Toto';
    font-style: sans-serif;
    font-weight: normal;
    src: local('Noto Serif Toto'), url('${publicPath('/fonts/noto_serif_toto.ttf')}') format('truetype');
  }
`;

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: desktopGlobalAssetCss }} />
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(App);
