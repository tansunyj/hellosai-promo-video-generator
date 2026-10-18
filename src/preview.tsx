import {createRoot} from 'react-dom/client';
import {Player} from '@remotion/player';
import {ShopPromoGenerator,getDuration,FPS,WIDTH,HEIGHT,VideoProps} from './Video';

declare global {
  interface Window {remotion_staticBase:string; updateVideoPreview:(props:VideoProps)=>void}
}
window.remotion_staticBase='/public';
const previewRoot=createRoot(document.getElementById('videoPreview')!);
window.updateVideoPreview=(props)=>{
  previewRoot.render(<Player key={JSON.stringify(props)} component={ShopPromoGenerator} inputProps={props} durationInFrames={getDuration(props.products.length)} fps={FPS} compositionWidth={WIDTH} compositionHeight={HEIGHT} controls initialFrame={24} style={{width:'100%'}}/>);
};
window.updateVideoPreview({products:[],renderConfig:{background:null,bgm:null}});
window.dispatchEvent(new Event('video-preview-ready'));
