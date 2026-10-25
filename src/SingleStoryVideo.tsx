import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {getStoryNarrative, fitStoryText, STORY_BOUNDARIES, STORY_DURATION} from './server/single-story-model.cjs';
import type {SingleStory} from './server/single-story-model.cjs';
import type {Product, VideoProps} from './Video';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const Copy: React.FC<{children: string; size?: number; width?: number; lines?: number; color?: string; weight?: number}> = ({children, size = 60, width = 888, lines = 2, color = '#202522', weight = 700}) => <div style={{fontSize: fitStoryText(children, width, size, 26, lines), lineHeight: 1.24, fontWeight: weight, overflowWrap: 'anywhere', textWrap: 'balance', color}}>{children}</div>;
const Mark: React.FC<{product: Product; size: number}> = ({product, size}) => product.image ? <Img src={staticFile(product.image)} style={{width: size, height: size, objectFit: 'contain', flexShrink: 0}}/> : <div style={{width: size, height: size, display: 'grid', placeItems: 'center', fontSize: size * 0.38, fontWeight: 900, color: product.color || '#A65F49'}}>AI</div>;
const headlineLines = (value: string) => value.includes('，') ? value.split('，').map((line, index, all) => line + (index < all.length - 1 ? '，' : '')) : [value];

export const SingleStoryVideo: React.FC<{product: Product; story: SingleStory; media: VideoProps['renderConfig']; storeUrl?: string}> = ({product, story, media, storeUrl}) => {
  const frame = useCurrentFrame();
  const phase = Math.min(4, Math.max(0, STORY_BOUNDARIES.findIndex((start, index) => frame >= start && frame < STORY_BOUNDARIES[index + 1])));
  const local = frame - STORY_BOUNDARIES[phase];
  const phaseDuration = STORY_BOUNDARIES[phase + 1] - STORY_BOUNDARIES[phase];
  const accent = story.accent;
  const narrative = getStoryNarrative(story);
  const question = headlineLines(story.hookTitle);
  const questionSize = Math.min(...question.map(line => fitStoryText(line, 888, 112, 42, question.length === 1 ? 2 : 1)));
  const reveal = (start: number, length = 9) => interpolate(local, [start, start + length], [0, 1], clamp);
  const sceneOpacity = phase === 0 ? 1 : interpolate(local, [0, 5, phaseDuration - 4, phaseDuration], [0, 1, 1, phase === 4 ? 1 : 0.35], clamp);
  const sceneY = phase === 0 ? 0 : interpolate(local, [0, 10], [24, 0], clamp);
  const activeStep = Math.min(2, Math.floor(local * 3 / phaseDuration));
  const cleanUrl = (storeUrl || 'https://www.16688.com.cn/shop/S393570').replace(/^https?:\/\//, '');

  return <AbsoluteFill style={{background: '#FAF9F6', color: '#202522', fontFamily: 'Microsoft YaHei, PingFang SC, sans-serif', overflow: 'hidden'}}>
    {media.background && <><Img src={staticFile(media.background)} style={{width: '100%', height: '100%', objectFit: 'cover', position: 'absolute'}}/><AbsoluteFill style={{background: 'rgba(250,249,246,' + (1 - story.backgroundStrength) + ')'}}/></>}
    <div style={{position: 'absolute', width: 420, height: 420, borderRadius: '50%', right: -210, top: 310, border: '2px solid ' + accent, opacity: 0.08, transform: 'scale(' + (1 + Math.sin(frame / 19) * 0.04) + ')'}}/>
    <div style={{position: 'absolute', top: 118, left: 82, right: 82, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 22}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}><div style={{width: 9, height: 36, background: accent, borderRadius: 8}}/><Copy size={31} width={610} lines={1}>{story.brand}</Copy></div>
      <div style={{fontSize: 24, color: '#69716C', letterSpacing: 1}}>{String(phase + 1).padStart(2, '0')} / 05</div>
    </div>

    <div style={{position: 'absolute', top: 315, left: 82, right: 82, opacity: sceneOpacity, transform: 'translateY(' + sceneY + 'px)'}}>
      {phase === 0 && <>
        <div style={{display: 'flex', alignItems: 'center', gap: 15, marginBottom: 32, opacity: reveal(0)}}><Mark product={product} size={42}/><Copy size={29} width={800} lines={1} color={accent} weight={800}>{narrative.goal}</Copy></div>
        <div style={{fontSize: questionSize, fontWeight: 900, lineHeight: 1.17, whiteSpace: 'pre-line', overflowWrap: 'anywhere', letterSpacing: -2}}>{question.join('\n')}</div>
        <div style={{marginTop: 48, maxWidth: 850, opacity: reveal(8)}}><Copy size={40} color={'#606762'}>{narrative.blocker}</Copy></div>
        <div style={{marginTop: 78, padding: '28px 31px', borderLeft: '6px solid ' + accent, background: 'rgba(255,255,255,.68)', opacity: reveal(24), transform: 'translateX(' + interpolate(local, [24, 36], [22, 0], clamp) + 'px)'}}>
          <div style={{fontSize: 25, color: accent, fontWeight: 800, marginBottom: 9}}>{narrative.question}</div>
          <Copy size={44} lines={2}>{narrative.solution}</Copy>
        </div>
      </>}

      {phase === 1 && <div style={{textAlign: 'center'}}>
        <div style={{fontSize: 27, color: accent, fontWeight: 800, letterSpacing: 3, marginBottom: 18}}>本期对应方案</div>
        <Copy size={61} width={900} lines={2}>{story.productTitle}</Copy>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 52, opacity: reveal(2), transform: 'scale(' + interpolate(local, [0, 13], [0.88, 1], clamp) + ')'}}><Mark product={product} size={176}/></div>
        <div style={{marginTop: 43, transform: 'scale(' + interpolate(local, [5, 17], [0.92, 1], clamp) + ')'}}><Copy size={174} width={900} lines={1} color={accent} weight={900}>{product.price}</Copy></div>
        <div style={{fontSize: 27, color: '#6B716D', marginTop: 8}}>页面参考价 · 对应当前商品规格</div>
        <div style={{marginTop: 56, paddingTop: 28, borderTop: '2px solid #DADBD5', opacity: reveal(20)}}><Copy size={38} width={890} color={accent}>{story.offerEvidence}</Copy></div>
      </div>}

      {phase === 2 && <>
        <div style={{fontSize: 28, color: accent, fontWeight: 800, marginBottom: 17}}>下单前先看清</div>
        <Copy size={78}>{story.reasonsTitle}</Copy>
        <div style={{display: 'grid', gap: 42, marginTop: 90}}>{narrative.details.map((point, index) => {
          const on = local >= 8 + index * 14;
          return <div key={index} style={{display: 'grid', gridTemplateColumns: '58px 1fr', gap: 22, alignItems: 'start', opacity: reveal(index * 13), transform: 'translateX(' + interpolate(local, [index * 13, index * 13 + 9], [18, 0], clamp) + 'px)'}}>
            <div style={{width: 48, height: 48, borderRadius: 25, display: 'grid', placeItems: 'center', background: on ? accent : 'transparent', border: '2px solid ' + accent, color: on ? '#FFF' : accent, fontSize: 27, fontWeight: 900}}>{on ? '✓' : index + 1}</div>
            <div><Copy size={48} width={800} lines={1}>{point.title}</Copy><div style={{marginTop: 10}}><Copy size={30} width={800} lines={2} color={'#68706A'} weight={500}>{point.detail}</Copy></div></div>
          </div>;
        })}</div>
      </>}

      {phase === 3 && <>
        <div style={{fontSize: 28, color: accent, fontWeight: 800, marginBottom: 17}}>办理路径</div>
        <Copy size={75}>{story.processTitle}</Copy>
        <div style={{marginTop: 26}}><Copy size={33} color={'#69716C'}>{story.processSubtitle}</Copy></div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 112, position: 'relative'}}>
          <div style={{position: 'absolute', height: 3, background: '#D7D8D2', left: 105, right: 105, top: 31}}><div style={{height: '100%', background: accent, width: (activeStep / 2 * 100) + '%', transition: 'none'}}/></div>
          {narrative.steps.map((step, index) => <div key={index} style={{textAlign: 'center', position: 'relative'}}><div style={{width: 64, height: 64, margin: '0 auto 27px', borderRadius: 34, display: 'grid', placeItems: 'center', background: index <= activeStep ? accent : '#FAF9F6', border: '2px solid ' + accent, color: index <= activeStep ? '#FFF' : accent, fontSize: 30, fontWeight: 900}}>{index + 1}</div><Copy size={34} width={250} lines={2} color={index <= activeStep ? '#202522' : '#8A908C'}>{step}</Copy></div>)}
        </div>
        <div style={{marginTop: 94, minHeight: 150, padding: '28px 32px', background: 'rgba(255,255,255,.72)', borderRadius: 24, border: '1px solid #E0E0DA'}}><div style={{fontSize: 24, color: accent, fontWeight: 800, marginBottom: 10}}>第 {activeStep + 1} 步</div><Copy size={36} width={820} lines={2}>{narrative.stepDetails[activeStep]}</Copy></div>
        <div style={{marginTop: 54, textAlign: 'center'}}><Copy size={34} color={accent}>{narrative.result}</Copy></div>
      </>}

      {phase === 4 && <div style={{textAlign: 'center'}}>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 4, transform: 'scale(' + interpolate(local, [0, 13], [0.82, 1], clamp) + ')'}}><Mark product={product} size={154}/></div>
        <div style={{marginTop: 38, fontSize: 30, color: accent, fontWeight: 800}}>{story.brand}</div>
        <div style={{marginTop: 32, fontSize: Math.min(...headlineLines(narrative.cta.title).map(line => fitStoryText(line, 888, 74, 34, 1))), fontWeight: 900, whiteSpace: 'pre-line', lineHeight: 1.28}}>{headlineLines(narrative.cta.title).join('\n')}</div>
        <div style={{marginTop: 54, background: accent, borderRadius: 58, padding: '29px 24px', boxShadow: '0 14px 32px ' + accent + '33', transform: 'scale(' + (1 + Math.sin(local / 7) * 0.012) + ')'}}><Copy size={47} width={830} color={'#FFFFFF'} weight={900}>{narrative.cta.button}</Copy></div>
        <div style={{fontSize: 29, color: '#5F6762', marginTop: 31}}>{narrative.cta.note}</div>
        <div style={{marginTop: 54, paddingTop: 29, borderTop: '2px solid #DADBD5'}}><div style={{fontSize: 27, fontWeight: 800}}>订阅小铺</div><div style={{fontSize: 25, color: accent, marginTop: 12}}>{cleanUrl}</div><div style={{fontSize: 25, color: '#737A75', marginTop: 13}}>{story.productTitle} · {product.price}</div></div>
      </div>}
    </div>

    <div style={{position: 'absolute', left: 82, right: 82, bottom: 220}}><Copy size={24} color={'#747B76'} lines={2} weight={500}>{story.disclaimer}</Copy></div>
    <div style={{position: 'absolute', left: 82, right: 82, bottom: 152, display: 'flex', gap: 11}}>{STORY_BOUNDARIES.slice(0, 5).map((start, index) => <div key={index} style={{height: 5, flex: 1, background: '#D9DAD5', borderRadius: 5, overflow: 'hidden'}}><div style={{height: '100%', background: accent, width: 100 * interpolate(frame, [start, STORY_BOUNDARIES[index + 1]], [0, 1], clamp) + '%'}}/></div>)}</div>
    <div style={{position: 'absolute', left: 82, right: 82, bottom: 90, display: 'flex', justifyContent: 'space-between', fontSize: 23, color: '#777E79'}}><span>本店自营推广 · 非相关品牌官方合作</span><span>{story.category}</span></div>
    {media.bgm && <Audio src={staticFile(media.bgm)} loop loopVolumeCurveBehavior="extend" volume={current => interpolate(current, [0, 12, STORY_DURATION - 18, STORY_DURATION], [0, 0.58, 0.58, 0], clamp)}/>}
  </AbsoluteFill>;
};

