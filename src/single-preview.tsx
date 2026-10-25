import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {ShopPromoGenerator, getDuration, FPS, WIDTH, HEIGHT, type VideoProps} from './Video';

declare global {
  interface Window {
    updateSingleVideoPreview?: (props: VideoProps) => void;
    clearSingleVideoPreview?: () => void;
  }
}
const container = document.getElementById('singleVideoPreview');
if (container) {
  const root = createRoot(container);
  const Preview: React.FC<{props: VideoProps}> = ({props}) => {
    const reference = useRef<PlayerRef>(null);
    useEffect(() => {
      const player = reference.current;
      if (!player) return;
      const ended = () => {player.pause(); player.seekTo(0);};
      player.addEventListener('ended', ended);
      return () => player.removeEventListener('ended', ended);
    }, []);
    return <Player ref={reference} component={ShopPromoGenerator} inputProps={props} durationInFrames={getDuration(props.products.length, props.videoConfig)} compositionWidth={WIDTH} compositionHeight={HEIGHT} fps={FPS} controls initialFrame={0} moveToBeginningWhenEnded={false} style={{width: '100%'}}/>;
  };
  window.updateSingleVideoPreview = props => root.render(<Preview key={JSON.stringify(props)} props={props}/>);
  window.clearSingleVideoPreview = () => root.render(<div style={{padding: 35, color: '#626A64', lineHeight: 1.8}}>从单品目录选择一个商品，自动填入五幕广告草稿。</div>);
  window.clearSingleVideoPreview();
  window.dispatchEvent(new Event('single-preview-ready'));
}
