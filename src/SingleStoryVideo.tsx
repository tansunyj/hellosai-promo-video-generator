import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {buildDecisionFlow, fitStoryText, STORY_BOUNDARIES, STORY_DURATION} from './server/single-story-model.cjs';
import type {SingleStory} from './server/single-story-model.cjs';
import type {Product, VideoProps} from './Video';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const Copy: React.FC<{children: string; size?: number; width?: number; lines?: number; color?: string; weight?: number; align?: 'left'|'center'|'right'}> = ({children, size = 60, width = 888, lines = 2, color = '#181B19', weight = 700, align = 'left'}) => <div style={{fontSize: fitStoryText(children, width, size, 24, lines), lineHeight: 1.22, fontWeight: weight, overflowWrap: 'anywhere', textWrap: 'balance', color, textAlign: align}}>{children}</div>;
const Mark: React.FC<{product: Product; size: number}> = ({product, size}) => product.image ? <Img src={staticFile(product.image)} style={{width: size, height: size, objectFit: 'contain', flexShrink: 0}}/> : <div style={{width: size, height: size, display: 'grid', placeItems: 'center', fontSize: size * 0.38, fontWeight: 950, color: product.color || '#A65F49'}}>AI</div>;
const compactTitle = (value: string) => value.replace(/\s*·\s*(充值方案|账号方案|商品方案|验证服务|兑换方案|权益方案)$/u, '').replace(/\s*·\s*/g, ' ').trim();

const Burst: React.FC<{accent: string; frame: number}> = ({accent, frame}) => <div style={{position: 'relative', width: 230, height: 230, transform: 'rotate(' + frame * 0.8 + 'deg)'}}>{Array.from({length: 16}, (_, index) => <span key={index} style={{position: 'absolute', left: 112, top: 112, width: 5, height: index % 2 ? 58 : 82, borderRadius: 8, background: accent, opacity: index % 2 ? 0.28 : 0.58, transformOrigin: '3px 3px', transform: 'rotate(' + index * 22.5 + 'deg) translateY(-86px)'}}/>)}</div>;

const EmotionalHeadline: React.FC<{value: string; accent: string; width?: number; size?: number; align?: 'left'|'center'}> = ({value, accent, width = 910, size = 118, align = 'left'}) => {
  const comma = value.indexOf('，');
  const lead = comma >= 0 ? value.slice(0, comma + 1) : value;
  const punch = comma >= 0 ? value.slice(comma + 1) : '';
  return <div style={{textAlign: align}}>
    <div style={{fontSize: fitStoryText(lead, width, size, 66, 1), lineHeight: 1.05, fontWeight: 950, letterSpacing: -4}}>{lead}</div>
    {punch && <div style={{fontSize: fitStoryText(punch, width, size, 66, 1), lineHeight: 1.05, fontWeight: 950, letterSpacing: -4, color: accent, marginTop: 10}}>{punch}</div>}
  </div>;
};

const ActionGlyph: React.FC<{accent: string; frame: number}> = ({accent, frame}) => {
  const pulse = 1 + Math.sin(frame / 5) * 0.045;
  return <div style={{width: 150, height: 150, margin: '0 auto', position: 'relative', transform: 'scale(' + pulse + ')'}}>
    <div style={{position: 'absolute', left: 30, right: 30, top: 18, height: 6, borderRadius: 6, background: accent}}/>
    <div style={{position: 'absolute', left: 30, right: 30, bottom: 18, height: 6, borderRadius: 6, background: accent}}/>
    <div style={{position: 'absolute', left: 47, top: 33, width: 56, height: 56, borderLeft: '7px solid ' + accent, borderRight: '7px solid ' + accent, transform: 'skewY(35deg)', opacity: 0.8}}/>
    <div style={{position: 'absolute', left: 47, bottom: 33, width: 56, height: 56, borderLeft: '7px solid #4C9CA6', borderRight: '7px solid #4C9CA6', transform: 'skewY(-35deg)', opacity: 0.8}}/>
  </div>;
};

export const SingleStoryVideo: React.FC<{product: Product; story: SingleStory; media: VideoProps['renderConfig']; storeUrl?: string}> = ({product, story, media, storeUrl}) => {
  const frame = useCurrentFrame();
  const phase = Math.min(4, Math.max(0, STORY_BOUNDARIES.findIndex((start, index) => frame >= start && frame < STORY_BOUNDARIES[index + 1])));
  const local = frame - STORY_BOUNDARIES[phase];
  const phaseDuration = STORY_BOUNDARIES[phase + 1] - STORY_BOUNDARIES[phase];
  const accent = story.accent;
  const decision = buildDecisionFlow(story, product);
  const reveal = (start: number, length = 10) => interpolate(local, [start, start + length], [0, 1], clamp);
  const lift = (start: number, distance = 28) => interpolate(local, [start, start + 11], [distance, 0], clamp);
  const sceneOpacity = interpolate(local, [0, 4, phaseDuration - 4, phaseDuration], [phase === 0 ? 1 : 0, 1, 1, phase === 4 ? 1 : 0], clamp);
  const activeStep = Math.min(2, Math.floor(local * 3 / phaseDuration));
  const title = compactTitle(decision.product.title);
  const cleanUrl = storeUrl?.replace(/^https?:\/\//, '');

  return <AbsoluteFill style={{background: '#FCFBF8', color: '#181B19', fontFamily: 'Microsoft YaHei UI, PingFang SC, sans-serif', overflow: 'hidden'}}>
    {media.background && <><Img src={staticFile(media.background)} style={{width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', opacity: Math.min(0.07, story.backgroundStrength * 0.32), filter: 'grayscale(1)'}}/><AbsoluteFill style={{background: 'rgba(252,251,248,.95)'}}/></>}

    <div style={{position: 'absolute', top: 64, left: 58, right: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 20, color: '#686E69', fontWeight: 800}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}><span style={{width: 10, height: 10, borderRadius: '50%', background: accent}}/>{story.brand}</div>
      <div>{decision.product.category}</div>
    </div>

    <div style={{position: 'absolute', inset: '145px 60px 118px', opacity: sceneOpacity}}>
      {phase === 0 && <>
        <div style={{marginTop: 105, fontSize: 27, color: '#707671', fontWeight: 850, letterSpacing: 2, opacity: reveal(0)}}>{decision.emotion.tension.eyebrow}</div>
        <div style={{marginTop: 38, opacity: reveal(4), transform: 'translateY(' + lift(4) + 'px)'}}><EmotionalHeadline value={decision.emotion.tension.headline} accent={accent}/></div>
        <div style={{height: 15, width: interpolate(local, [10, 28], [75, 650], clamp), borderRadius: 10, background: accent, marginTop: 30}}/>
        <div style={{marginTop: 38, opacity: reveal(14)}}><Copy size={35} width={850} lines={2} color="#555C57" weight={650}>{decision.emotion.tension.subline}</Copy></div>

        <div style={{marginTop: 105, opacity: reveal(26), transform: 'translateY(' + lift(26, 42) + 'px)'}}>
          <div style={{fontSize: 24, color: '#747A75', fontWeight: 850, letterSpacing: 3}}>{decision.price.label}</div>
          <div style={{fontSize: fitStoryText(decision.price.referencePrice, 920, 178, 108, 1), lineHeight: 1, color: accent, fontWeight: 950, letterSpacing: -7, marginTop: 11}}>{decision.price.referencePrice}</div>
          <div style={{marginTop: 20}}><Copy size={29} width={850} lines={2} color="#656B67" weight={650}>{decision.price.answer}</Copy></div>
        </div>
      </>}

      {phase === 1 && <div style={{textAlign: 'center'}}>
        <div style={{fontSize: 28, color: '#626864', fontWeight: 900, letterSpacing: 5, marginTop: 25}}>这款到底是什么？</div>
        <div style={{height: 265, marginTop: 35, position: 'relative', display: 'grid', placeItems: 'center'}}>
          <div style={{position: 'absolute', opacity: reveal(0), transform: 'scale(' + interpolate(local, [0, 12], [0.4, 1], clamp) + ')'}}><Burst accent={accent} frame={local}/></div>
          <div style={{position: 'relative', width: 148, height: 148, borderRadius: '50%', background: '#FFF', display: 'grid', placeItems: 'center', boxShadow: '0 10px 35px rgba(32,35,32,.10)', opacity: reveal(3)}}><Mark product={product} size={116}/></div>
        </div>
        <div style={{marginTop: 6}}><Copy size={68} width={900} lines={2} weight={950} align="center">{decision.product.title}</Copy></div>
        <div style={{fontSize: fitStoryText(decision.price.referencePrice, 900, 174, 104, 1), lineHeight: 1, color: accent, fontWeight: 950, letterSpacing: -6, marginTop: 38, opacity: reveal(12), transform: 'translateY(' + lift(12, 38) + 'px)'}}>{decision.price.referencePrice}</div>
        <div style={{fontSize: 23, color: '#727873', marginTop: 15}}>页面参考价 · 对应当前商品规格</div>
        <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 18, marginTop: 54, opacity: reveal(22)}}>{decision.product.specs.map((fact, index) => <div key={index} style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 27, fontWeight: 850}}><span style={{width: 25, height: 25, borderRadius: '50%', border: '6px solid ' + accent}}/>{fact}</div>)}</div>
        <div style={{marginTop: 47, opacity: reveal(28)}}><Copy size={32} width={880} lines={2} color="#565D58" weight={700} align="center">{decision.product.answer}</Copy></div>
      </div>}

      {phase === 2 && <>
        <div style={{marginTop: 36, fontSize: 27, color: '#6A706B', fontWeight: 850, letterSpacing: 2}}>{decision.emotion.reassurance.eyebrow}</div>
        <div style={{marginTop: 25, opacity: reveal(0), transform: 'translateY(' + lift(0) + 'px)'}}><EmotionalHeadline value={decision.emotion.reassurance.headline} accent={accent} size={92}/></div>
        <div style={{fontSize: 27, color: '#747A75', marginTop: 27}}>{decision.emotion.reassurance.subline}</div>
        <div style={{marginTop: 62}}>{decision.trust.facts.map((point, index) => <div key={index} style={{display: 'grid', gridTemplateColumns: '58px 1fr', gap: 21, padding: '22px 0', borderBottom: index < 2 ? '2px solid #E4E1DA' : 'none', opacity: reveal(9 + index * 8), transform: 'translateX(' + interpolate(local, [9 + index * 8, 18 + index * 8], [24, 0], clamp) + 'px)'}}>
          <div style={{width: 48, height: 48, borderRadius: '50%', background: index === Math.min(2, Math.floor(local / 18)) ? accent : '#ECE9E2', color: index === Math.min(2, Math.floor(local / 18)) ? '#FFF' : '#5E645F', display: 'grid', placeItems: 'center', fontSize: 23, fontWeight: 950}}>✓</div>
          <div><Copy size={38} width={760} lines={1} weight={950}>{point.title}</Copy><div style={{marginTop: 6}}><Copy size={26} width={760} lines={2} color="#666C68" weight={560}>{point.detail}</Copy></div></div>
        </div>)}</div>
        <div style={{marginTop: 35, paddingLeft: 20, borderLeft: '5px solid ' + accent}}><Copy size={25} width={830} lines={2} color="#666C68" weight={650}>{decision.product.boundary}</Copy></div>
      </>}

      {phase === 3 && <>
        <div style={{marginTop: 64, fontSize: 86, lineHeight: 1, fontWeight: 950, letterSpacing: -4}}>怎么买？</div>
        <div style={{fontSize: 86, lineHeight: 1, color: accent, fontWeight: 950, letterSpacing: -4, marginTop: 12}}>三步就清楚</div>
        <div style={{marginTop: 45, fontSize: 27, color: '#69706B'}}>{decision.process.subtitle}</div>
        <div style={{position: 'relative', marginTop: 130, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18}}>
          <div style={{position: 'absolute', left: 140, right: 140, top: 35, height: 4, background: '#D7D5CF'}}><div style={{height: '100%', width: activeStep / 2 * 100 + '%', background: accent}}/></div>
          {decision.process.steps.map((step, index) => <div key={index} style={{textAlign: 'center', position: 'relative', opacity: reveal(index * 7)}}>
            <div style={{width: 74, height: 74, borderRadius: '50%', margin: '0 auto 27px', background: index <= activeStep ? accent : '#FCFBF8', border: '4px solid ' + accent, color: index <= activeStep ? '#FFF' : accent, display: 'grid', placeItems: 'center', fontSize: 29, fontWeight: 950}}>{index + 1}</div>
            <Copy size={34} width={270} lines={2} color={index <= activeStep ? '#181B19' : '#888E89'} weight={900} align="center">{step.title}</Copy>
          </div>)}
        </div>
        <div style={{margin: '110px auto 0', width: 790, textAlign: 'center', opacity: reveal(16)}}><div style={{fontSize: 23, color: accent, fontWeight: 900, marginBottom: 10}}>第 {activeStep + 1} 步</div><Copy size={34} width={790} lines={3} color="#505752" weight={750} align="center">{decision.process.steps[activeStep].detail}</Copy></div>
      </>}

      {phase === 4 && <div style={{textAlign: 'center', paddingTop: 160}}>
        <div style={{opacity: reveal(0)}}><ActionGlyph accent={accent} frame={local}/></div>
        <div style={{fontSize: 27, color: '#656C67', fontWeight: 850, letterSpacing: 4, marginTop: 36}}>{title} · {decision.emotion.action.eyebrow}</div>
        <div style={{marginTop: 18}}><Copy size={86} width={900} lines={2} weight={950} align="center">{decision.emotion.action.headline}</Copy></div>
        <div style={{marginTop: 24}}><Copy size={39} width={860} lines={2} color="#4F5651" weight={760} align="center">{decision.action.title}</Copy></div>
        <div style={{marginTop: 62, border: '4px solid ' + accent, borderRadius: 999, padding: '25px 30px', background: '#FFF', boxShadow: '0 10px 0 ' + accent + '22', transform: 'scale(' + (1 + Math.sin(local / 5) * 0.018) + ')'}}><Copy size={46} width={820} lines={1} color={accent} weight={950} align="center">{decision.action.button}</Copy></div>
        <div style={{fontSize: 27, color: '#656C67', marginTop: 30}}>{decision.action.note}</div>
        <div style={{display: 'inline-flex', gap: 10, alignItems: 'baseline', marginTop: 30, fontSize: 22, color: '#747A75'}}><span>{decision.price.label}</span><strong style={{fontSize: 32, color: accent}}>{decision.price.referencePrice}</strong></div>
        {cleanUrl && <div style={{fontSize: 22, color: '#747A75', marginTop: 22}}>{cleanUrl}</div>}
      </div>}
    </div>

    <div style={{position: 'absolute', left: 58, right: 58, bottom: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 30, fontSize: 18, color: '#7B817C'}}><span>第三方商业推广 · 非相关品牌官方合作</span><span style={{maxWidth: 520, textAlign: 'right'}}>{phase === 4 ? decision.action.disclaimer : '价格、适用条件与售后以商品页面为准'}</span></div>
    {media.bgm && <Audio src={staticFile(media.bgm)} loop loopVolumeCurveBehavior="extend" volume={current => interpolate(current, [0, 10, STORY_DURATION - 15, STORY_DURATION], [0, 0.62, 0.62, 0], clamp)}/>}
  </AbsoluteFill>;
};
