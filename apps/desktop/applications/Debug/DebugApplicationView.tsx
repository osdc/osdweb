import { WindowProps } from '@/components/WindowManagement/WindowCompositor';
import { useEffect, useState } from 'react';

function getTargetUrl(time: number): string {
  return `/images/temp.png?t=${time}`;
}

export default function DebugApplicationView(props: WindowProps) {
  const { application, windowContext } = props;

  const [time, _] = useState(Date.now());
  const url = getTargetUrl(time);
  
  function onClickButton() {
    application.apis.sound.play('/sounds/meow.mp3', 0.25);
  }

  useEffect(() => { 
    return () => { }
  }, []);

  return (
    <>
      <button onClick={onClickButton}>play test sound</button>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'block',
        background: `url(${url})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}></div>
    </>
  )
} 