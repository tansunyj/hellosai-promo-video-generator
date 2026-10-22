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
  const productKey=props.products.map(product=>[product.id??'',product.title,product.price,product.image].join(':')).join('|');
  const playerKey=productKey+'::'+JSON.stringify(props.videoConfig||{});

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
  },[playerKey]);

  useEffect(()=>{
    let timer:ReturnType<typeof setTimeout>|undefined;
    let attempts=0;
    const resetPoster=()=>{
      const player=playerRef.current;
      if(!player)return;
      player.pause();
      player.seekTo(posterFrame);
      attempts+=1;
      if(attempts<4)timer=setTimeout(resetPoster,80);
    };
    resetPoster();
    return()=>{if(timer)clearTimeout(timer)};
  },[playerKey]);

  return <div style={{position:'relative',width:'100%',height:'100%',overflow:'hidden'}}>
    <Player
      key={playerKey}
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
  const productKey=props.products.map(product=>[product.id??'',product.title,product.price,product.image].join(':')).join('|');
  previewRoot.render(<PreviewPlayer key={productKey+'::'+JSON.stringify(props.videoConfig||{})} props={props}/>);
  window.dispatchEvent(new CustomEvent('video-duration-updated',{detail:{revision:TEMPLATE_REVISION,seconds:getDuration(props.products.length,props.videoConfig)/FPS,count:props.products.length}}));
};

window.updateVideoPreview(defaultVideoProps);
window.dispatchEvent(new Event('video-preview-ready'));

