import {AbsoluteFill, Img, staticFile} from 'remotion';
import {fitStoryText, getStoryNarrative} from './server/single-story-model.cjs';
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
  if (punctuation.length > 1 && punctuation.length <= 3) return punctuation;
  const latinLead = cleaned.match(/^([A-Za-z][A-Za-z0-9.+-]*(?:\s+[A-Za-z0-9.+-]+)*)([\u3400-\u9fff].*)$/u);
  if (latinLead) return [latinLead[1], ...splitByUnits(latinLead[2], 7)].slice(0, 3);
  return splitByUnits(cleaned, 8).slice(0, 3);
};

const ProductMark: React.FC<{product: Product}> = ({product}) => product.image ? <Img src={staticFile(product.image)} style={{width: 142, height: 142, objectFit: 'contain'}}/> : <div style={{fontSize: 54, fontWeight: 950, color: product.color || '#A65F49'}}>AI</div>;
const FactChip: React.FC<{children: string}> = ({children}) => <div style={{padding: '15px 20px', borderRadius: 999, background: '#F4EBDD', color: '#282B29', fontSize: 25, fontWeight: 800, whiteSpace: 'nowrap'}}>{children}</div>;

export const SingleProductCover: React.FC<VideoProps> = ({products, singleStory, renderConfig}) => {
  const product = products[0];
  const story = singleStory as SingleStory | undefined;
  if (!product || !story) return <AbsoluteFill style={{background: '#F4EBDD', display: 'grid', placeItems: 'center', fontSize: 44, fontWeight: 900}}>请选择单品</AbsoluteFill>;
  const narrative = getStoryNarrative(story);
  const lines = coverHeadline(story.hookTitle);
  const accent = story.accent || '#A65F49';
  const facts = (product.facts?.length ? product.facts : story.points.map(point => point.title)).slice(0, 3);

  return <AbsoluteFill style={{background: '#F4EBDD', color: '#111412', fontFamily: 'Microsoft YaHei UI, PingFang SC, sans-serif', overflow: 'hidden'}}>
    {renderConfig.background && <Img src={staticFile(renderConfig.background)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, filter: 'saturate(.45) contrast(1.08)'}}/>}
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(155deg,rgba(255,255,255,.42),rgba(244,235,221,.92) 43%,rgba(238,222,201,.96))'}}/>
    <div style={{position: 'absolute', width: 560, height: 560, borderRadius: '50%', background: accent, opacity: 0.12, right: -250, top: -175}}/>
    <div style={{position: 'absolute', width: 430, height: 120, background: '#111412', right: -92, top: 864, transform: 'rotate(-12deg)'}}/>
    <div style={{position: 'absolute', right: 2, top: 855, transform: 'rotate(-12deg)', color: '#FFF8EB', fontSize: 35, fontWeight: 950, letterSpacing: 5}}>先把问题看清</div>

    <div style={{position: 'absolute', top: 72, left: 66, right: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 13, fontSize: 27, fontWeight: 900}}><span style={{width: 18, height: 18, background: accent, borderRadius: '50%'}}/>{story.brand}</div>
      <div style={{padding: '12px 20px', border: '3px solid #111412', borderRadius: 999, fontSize: 23, fontWeight: 900, letterSpacing: 1}}>{story.category}</div>
    </div>

    <div style={{position: 'absolute', top: 202, left: 66, right: 66}}>
      <div style={{fontSize: 27, fontWeight: 900, color: accent, letterSpacing: 4, marginBottom: 20}}>你是不是也遇到了</div>
      <div style={{display: 'grid', gap: 3}}>{lines.map((line, index) => <div key={index} style={{display: 'flex'}}><div style={{fontSize: fitStoryText(line, 884, index === lines.length - 1 ? 158 : 142, 76, 1), lineHeight: 1.03, fontWeight: 950, letterSpacing: -5, padding: index === lines.length - 1 ? '3px 18px 13px 10px' : '0 8px', background: index === lines.length - 1 ? accent : 'transparent', color: index === lines.length - 1 ? '#FFF9EF' : '#111412', transform: index === lines.length - 1 ? 'rotate(-1.3deg)' : undefined}}>{line}</div></div>)}</div>
      <div style={{marginTop: 34, maxWidth: 760, fontSize: fitStoryText(narrative.blocker, 760, 36, 28, 2), lineHeight: 1.42, fontWeight: 700, color: '#4A4D49'}}>{narrative.blocker}</div>
    </div>

    <div style={{position: 'absolute', top: 716, left: 70, width: 190, height: 190, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#FFF9F0', border: '9px solid #111412', boxShadow: '12px 14px 0 '+accent, transform: 'rotate(-5deg)'}}><ProductMark product={product}/></div>
    <div style={{position: 'absolute', top: 732, left: 300, right: 70}}>
      <div style={{fontSize: 28, fontWeight: 950, color: accent}}>本期对应方案</div>
      <div style={{fontSize: fitStoryText(story.productTitle, 650, 51, 33, 2), lineHeight: 1.24, fontWeight: 950, marginTop: 12}}>{story.productTitle}</div>
    </div>

    <div style={{position: 'absolute', left: 54, right: 54, bottom: 104, padding: 8, borderRadius: 48, background: 'rgba(17,20,18,.13)', border: '2px solid rgba(17,20,18,.08)'}}>
      <div style={{height: 672, borderRadius: 40, background: '#111412', color: '#FFF9F0', padding: '52px 50px', boxShadow: 'inset 0 2px 0 rgba(255,255,255,.12)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 20}}><div><div style={{fontSize: 23, color: '#D6D0C6', fontWeight: 700, letterSpacing: 2}}>页面参考价</div><div style={{fontSize: fitStoryText(product.price, 500, 116, 70, 1), lineHeight: 1.05, color: '#FFF9F0', fontWeight: 950, marginTop: 7, letterSpacing: -4}}>{product.price}</div></div><div style={{width: 132, height: 132, borderRadius: '50%', background: accent, display: 'grid', placeItems: 'center', fontSize: 54, fontWeight: 950, transform: 'rotate(8deg)'}}>?</div></div>
        <div style={{marginTop: 34, fontSize: fitStoryText(narrative.solution, 820, 42, 30, 2), lineHeight: 1.34, fontWeight: 900}}>{narrative.solution}</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 13, marginTop: 35}}>{facts.map((fact, index) => <FactChip key={index}>{fact}</FactChip>)}</div>
        <div style={{height: 2, background: 'rgba(255,255,255,.16)', margin: '38px 0 27px'}}/>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}><div style={{width: 48, height: 48, borderRadius: '50%', background: accent, display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 950}}>✓</div><div style={{fontSize: 29, fontWeight: 800}}>先核对地区、档位与对应规格</div></div>
        <div style={{fontSize: 21, color: '#AAAFA9', marginTop: 22}}>具体适用条件、库存与售后以商品页面为准</div>
      </div>
    </div>
  </AbsoluteFill>;
};

