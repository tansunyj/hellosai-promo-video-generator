import {createRoot} from 'react-dom/client';
import {Player,PlayerRef} from '@remotion/player';
import {useEffect,useRef} from 'react';
import {ShopPromoGenerator,getDuration,FPS,WIDTH,HEIGHT,VideoProps,TEMPLATE_REVISION,defaultVideoProps} from './Video';

declare global {
  interface Window {remotion_staticBase:string; updateVideoPreview:(props:VideoProps)=>void}
}

window.remotion_staticBase='/public';
const previewRoot=createRoot(document.getElementById('videoPreview')!);
const posterFrame=78;

const PreviewPlayer:React.FC<{props:VideoProps}>=({props})=>{
  const playerRef=useRef<PlayerRef>(null);
  const duration=getDuration(props.products.length,props.videoConfig);

  useEffect(()=>{
    const player=playerRef.current;
    if(!player)return;
    const handlePlay=()=>{
      if(player.getCurrentFrame()!==0)player.seekTo(0);
    };
    const handleEnded=()=>{
      player.seekTo(posterFrame);
    };
    player.addEventListener('play',handlePlay);
    player.addEventListener('ended',handleEnded);
    return()=>{
      player.removeEventListener('play',handlePlay);
      player.removeEventListener('ended',handleEnded);
    };
  },[props]);

  return <div style={{position:'relative',width:'100%',height:'100%',overflow:'hidden'}}>
    <Player
      ref={playerRef}
      component={ShopPromoGenerator}
      inputProps={props}
      durationInFrames={duration}
      fps={FPS}
      compositionWidth={WIDTH}
      compositionHeight={HEIGHT}
      controls
      initialFrame={posterFrame}
      moveToBeginningWhenEnded={false}
      style={{width:'100%'}}
    />
  </div>;
};

window.updateVideoPreview=(props)=>{
  previewRoot.render(<PreviewPlayer key={JSON.stringify(props)} props={props}/>);
  window.dispatchEvent(new CustomEvent('video-duration-updated',{detail:{revision:TEMPLATE_REVISION,seconds:getDuration(props.products.length,props.videoConfig)/FPS,count:props.products.length}}));
};

window.updateVideoPreview(defaultVideoProps);
window.dispatchEvent(new Event('video-preview-ready'));

