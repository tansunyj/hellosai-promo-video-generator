import {AbsoluteFill, Img, staticFile} from 'remotion';
import {buildDecisionFlow, fitStoryText} from './server/single-story-model.cjs';
import type {SingleStory} from './server/single-story-model.cjs';
import type {Product, VideoProps} from './Video';

const splitByUnits = (value: string, size: number) => {
  const chars = Array.from(value.trim());
  if (chars.length <= size) return [value.trim()];
  const lines: string[] = [];
  for (let index = 0; index < chars.length; index += size) lines.push(chars.slice(index, index + size).join(''));
  return lines;
};

const coverHeadline = (value: string) => {
  const cleaned = String(value || '').replace(/\s+/g, ' ').trim();
  const punctuation = cleaned.split(/(?<=[，！？?])/u).map(line => line.trim()).filter(Boolean);
  if (punctuation.length > 1 && punctuation.length <= 2) return punctuation;
  const latinLead = cleaned.match(/^([A-Za-z][A-Za-z0-9.+-]*(?:\s+[A-Za-z0-9.+-]+)*)([\u3400-\u9fff].*)$/u);
  if (latinLead) return [latinLead[1], ...splitByUnits(latinLead[2], 8)].slice(0, 3);
  return splitByUnits(cleaned, 9).slice(0, 3);
};

const compactTitle = (value: string) => value.replace(/\s*·\s*(充值方案|账号方案|商品方案|验证服务|兑换方案|权益方案)$/u, '').replace(/\s*·\s*/g, ' ').trim();
const ProductMark: React.FC<{product: Product}> = ({product}) => product.image ? <Img src={staticFile(product.image)} style={{width: 132, height: 132, objectFit: 'contain'}}/> : <div style={{fontSize: 54, fontWeight: 950, color: product.color || '#A65F49'}}>AI</div>;

export const SingleProductCover: React.FC<VideoProps> = ({products, singleStory, renderConfig}) => {
  const product = products[0];
  const story = singleStory as SingleStory | undefined;
  if (!product || !story) return <AbsoluteFill style={{background: '#FBFAF7', display: 'grid', placeItems: 'center', fontSize: 44, fontWeight: 900}}>请选择单品</AbsoluteFill>;
  const decision = buildDecisionFlow(story, product);
  const lines = coverHeadline(decision.emotion.tension.headline);
  const accent = story.accent || '#A65F49';
  const facts = decision.trust.facts.map(point => point.title).slice(0, 3);
  const title = compactTitle(decision.product.title);

  return <AbsoluteFill style={{background: '#FBFAF7', color: '#151816', fontFamily: 'Microsoft YaHei UI, PingFang SC, sans-serif', overflow: 'hidden'}}>
    {renderConfig.background && <Img src={staticFile(renderConfig.background)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08, filter: 'saturate(.3)'}}/>}
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(155deg,rgba(255,255,255,.3),rgba(251,250,247,.94) 48%,rgba(244,239,230,.98))'}}/>
    <div style={{position: 'absolute', right: -190, top: 410, width: 430, height: 430, borderRadius: '50%', background: accent, opacity: 0.1}}/>
    <div style={{position: 'absolute', left: -170, bottom: 185, width: 390, height: 390, borderRadius: '50%', border: '46px solid ' + accent, opacity: 0.08}}/>

    <div style={{position: 'absolute', top: 72, left: 62, right: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 13, fontSize: 27, fontWeight: 950}}><span style={{width: 18, height: 18, background: accent, borderRadius: '50%'}}/>{story.brand}</div>
      <div style={{padding: '11px 20px', border: '3px solid #151816', borderRadius: 999, fontSize: 23, fontWeight: 900}}>{story.category}</div>
    </div>

    <div style={{position: 'absolute', top: 205, left: 62, right: 62}}>
      <div style={{fontSize: 27, fontWeight: 900, color: accent, letterSpacing: 4}}>如果你也卡在这一步</div>
      <div style={{display: 'grid', gap: 2, marginTop: 24}}>{lines.map((line, index) => <div key={index} style={{fontSize: fitStoryText(line, 930, 150, 72, 1), lineHeight: 1.04, fontWeight: 950, letterSpacing: -5}}>{line}</div>)}</div>
      <div style={{width: 650, maxWidth: '72%', height: 18, borderRadius: 9, background: accent, marginTop: 22}}/>
      <div style={{marginTop: 34, maxWidth: 820, fontSize: fitStoryText(decision.price.blocker, 820, 38, 29, 2), lineHeight: 1.42, fontWeight: 700, color: '#4F5551'}}>{decision.emotion.tension.subline}</div>
    </div>

    <div style={{position: 'absolute', top: 790, left: 62, right: 62, minHeight: 310, borderRadius: 34, background: '#151816', color: '#FFFDF8', padding: '39px 42px', boxShadow: '0 18px 50px rgba(25,27,25,.16)'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30}}>
        <div><div style={{fontSize: 24, color: '#CCC8BF', fontWeight: 800, letterSpacing: 2}}>{decision.price.label}</div><div style={{fontSize: fitStoryText(decision.price.referencePrice, 600, 134, 80, 1), lineHeight: 1, color: '#FFFDF8', fontWeight: 950, letterSpacing: -5, marginTop: 12}}>{decision.price.referencePrice}</div></div>
        <div style={{width: 162, height: 162, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#FFFDF8', border: '9px solid ' + accent, boxShadow: '9px 10px 0 ' + accent}}><ProductMark product={product}/></div>
      </div>
      <div style={{marginTop: 31, fontSize: fitStoryText(decision.product.answer, 820, 40, 30, 2), lineHeight: 1.35, fontWeight: 900}}>{decision.product.answer}</div>
    </div>

    <div style={{position: 'absolute', top: 1160, left: 62, right: 62}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20}}><div><div style={{fontSize: 24, color: accent, fontWeight: 900}}>本期对应方案</div><div style={{fontSize: fitStoryText(title, 720, 54, 35, 2), lineHeight: 1.2, fontWeight: 950, marginTop: 8}}>{title}</div></div><div style={{fontSize: 62, color: accent, fontWeight: 950}}>→</div></div>
      <div style={{display: 'grid', gap: 15, marginTop: 38}}>{facts.map((fact, index) => <div key={index} style={{height: 78, borderRadius: 22, background: '#FFFDF8', border: '2px solid #DED9CF', display: 'grid', gridTemplateColumns: '58px 1fr', alignItems: 'center', padding: '0 24px', fontSize: 30, fontWeight: 900}}><span style={{width: 38, height: 38, borderRadius: '50%', background: accent, color: '#FFF', display: 'grid', placeItems: 'center', fontSize: 22}}>✓</span><span>{fact}</span></div>)}</div>
    </div>

    <div style={{position: 'absolute', left: 62, right: 62, bottom: 128, paddingTop: 28, borderTop: '4px solid #151816', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 28}}>
      <div style={{maxWidth: 690, fontSize: fitStoryText(decision.action.title, 690, 39, 29, 2), lineHeight: 1.3, fontWeight: 950}}>{decision.action.title}</div>
      <div style={{padding: '17px 24px', borderRadius: 999, background: accent, color: '#FFF', fontSize: 25, fontWeight: 950, whiteSpace: 'nowrap'}}>先核对方案</div>
    </div>
    <div style={{position: 'absolute', left: 62, right: 62, bottom: 62, display: 'flex', justifyContent: 'space-between', fontSize: 21, color: '#6E746F'}}><span>第三方商业推广</span><span>适用条件与售后以商品页面为准</span></div>
  </AbsoluteFill>;
};
