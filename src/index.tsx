import {registerRoot,Composition} from 'remotion';
import {ShopPromoGenerator,defaultVideoProps,getDuration,FPS,WIDTH,HEIGHT} from './Video';
import {SingleProductCover} from './SingleProductCover';
export const RemotionRoot=()=> <>
  <Composition id="ShopPromoGenerator" component={ShopPromoGenerator} defaultProps={defaultVideoProps} durationInFrames={getDuration(defaultVideoProps.products.length,defaultVideoProps.videoConfig)} calculateMetadata={({props})=>({durationInFrames:getDuration(props.products.length,props.videoConfig)})} fps={FPS} width={WIDTH} height={HEIGHT}/>
  <Composition id="SingleProductCover" component={SingleProductCover} defaultProps={defaultVideoProps} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT}/>
</>;
registerRoot(RemotionRoot);
