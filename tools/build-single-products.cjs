const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {createCopywriting} = require('../src/server/single-copywriting.cjs');
const {normalizeStory, stockStatus} = require('../src/server/single-story-model.cjs');
const {sanitizeDisplayProduct} = require('../src/server/single-copy-policy.cjs');
const {identifyOffer} = require('../src/server/single-offer-types.cjs');
const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'data', 'single-product');
const snapshot = path.join(directory, 'source-products.json');
const destination = path.join(root, 'public', '商品文案.json');
const compatibility = path.join(directory, 'single-products.json');

function classify(product) {
  const title = product.rawTitle || product.displayTitle || '';
  const names = [[/claude/i, 'Claude'], [/gemini/i, 'Gemini'], [/codex/i, 'Codex'], [/grok|supergro|\bgro\b|9rok/i, 'Grok'], [/g[tp][pt]|chatgpt|gt\.p/i, 'ChatGPT'], [/google|gmail/i, 'Google'], [/cursor/i, 'Cursor'], [/多邻国|duolingo/i, '多邻国'], [/steam|stream/i, 'Steam']];
  let brand = names.find(([pattern]) => pattern.test(title))?.[1] || (/O社/.test(product.category) ? 'ChatGPT' : /A社/.test(product.category) ? 'Claude' : /9rok/.test(product.category) ? 'Grok' : undefined);
  if (/\bmuse\b/i.test(title)) brand = 'Muse';
  if (!brand && /Google个人邮箱|个人谷歌|gmail|谷歌后缀/i.test(title) && !/非个人谷歌/.test(title)) brand = 'Google';
  if (/O社/.test(product.category) && !/claude|gemini|grok|supergro/i.test(title) && /free|team|plus|pro|GTP|GPT/i.test(title)) brand = /codex/i.test(title) ? 'Codex' : 'ChatGPT';
  const tier = title.match(/(?:Super\s*)?Ultra|Max\s*20x|Max\s*5x|Business(?:\/team)?|Plus|Pro(?:\s*200|\s*100)?|Super/i)?.[0];
  const periodTitle = title.replace(/【[^】]*质保[^】]*】|（[^）]*质保[^）]*）|\([^)]*质保[^)]*\)/g, '').replace(/质保(?:订阅)?\s*(?:一个月|\d+个?月|\d+天)/g, '');
  const duration = periodTitle.match(/\d+个?月|\d+年|一个月|月卡|周卡|日卡/)?.[0];
  const kind = /租用|使用权/.test(title) ? '租用方案' : /成品号|成品账号|成品会员号/.test(title) ? '账号方案' : /兑换链接|礼品链接|激活链接/.test(title) ? '兑换方案' : /官充|直充|直冲|充值|代充|代付/.test(title) ? '充值方案' : /接马|接码|接\s*\||收码|验证/.test(title) && !/已接马|已接码/.test(title) ? '验证服务' : /领取|权益激活/.test(title) ? '权益方案' : /账号|白号|邮箱|谷歌后缀/.test(title) ? '账号方案' : '商品方案';
  const fallback = (product.displayTitle || title).replace(/[…]/g, '').replace(/【[^】]*】/g, '').trim();
  const format = kind === '验证服务' ? '注册验证' : /成品号/.test(title) ? '成品号' : kind === '账号方案' ? '账号' : kind === '兑换方案' ? '兑换链接' : !tier && !duration ? kind : '';
  const shortTitle = brand ? [...new Set([brand + (tier ? ' ' + tier : ''), duration, format].filter(Boolean))].join(' · ') : Array.from(fallback).length <= 64 ? fallback : (product.category || '商品') + '方案';
  const offer = identifyOffer(product, {brand, tier, shortTitle, kind, duration, title});
  return {...offer, duration, title};
}

function formatProduct(product, index, sourceHash, logos) {
  const info = classify(product);
  const copy = createCopywriting(product, info);
  const sourceImage = product.image ? 'assets/' + product.image.replace(/^assets\//, '') : '';
  return {
    ...product,
    originalProduct: {...product},
    copywriting: {version: 7, profile: copy.profile, chain: copy.chain, evidence: copy.evidence, hookOptions: copy.hookOptions, structure: ['商品专属目标与卡点', '匹配交付形式的解法', '权益与风险边界', '具体办理与验收', '针对卡点的行动入口']},
    id: product.id,
    category: product.category || '',
    stock: product.stock ?? '',
    stockStatus: stockStatus(product.stock),
    product: sanitizeDisplayProduct({id: product.id, title: info.shortTitle, label: info.kind, price: product.price || '价格见商品详情', image: logos[sourceImage] || sourceImage, facts: copy.story.points.map(point => point.title), color: '#A65F49'}, info),
    story: normalizeStory({brand: '杰哥AI订阅小铺', category: info.kind, productTitle: info.shortTitle, ...copy.story, confirmed: false}),
    source: {file: 'source-products.json', index, sha256: sourceHash, rawTitle: product.rawTitle || '', displayTitle: product.displayTitle || '', originalPrice: product.price || '', originalDelivery: product.delivery || '', originalFacts: product.facts || []},
    review: {required: true, warnings: [copy.profile === 'needs-review' || copy.profile === 'subscription-review' ? '原数据未明确服务形式；必须确认可承接的卡点与交付方式后再使用文案' : '', /[…]|\.\.\./.test(product.displayTitle || '') ? '原展示名已截断，短名由原始名称整理，需核对' : '', /活动已结束|请勿下单|已下架/.test(info.title) ? '原名包含停止销售提示，请勿直接宣传' : '', '这是源文件快照，不是实时库存'].filter(Boolean)}
  };
}

function build() {
  fs.mkdirSync(directory, {recursive: true});
  if (!fs.existsSync(snapshot)) fs.copyFileSync(path.join(root, 'public', '商品目录.json'), snapshot, fs.constants.COPYFILE_EXCL);
  const bytes = fs.readFileSync(snapshot);
  const raw = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
  const products = Array.isArray(raw) ? raw : raw.products;
  if (!Array.isArray(products)) throw new Error('商品副本中没有products数组');
  const sourceHash = crypto.createHash('sha256').update(bytes).digest('hex');
  const logos = JSON.parse(fs.readFileSync(path.join(root, 'src', 'logo-assets.json'), 'utf8'));
  const result = {schemaVersion: 1, generatedAt: new Date().toISOString(), source: {file: 'source-products.json', sha256: sourceHash, count: products.length}, template: 'single_story', products: products.map((product, index) => formatProduct(product, index, sourceHash, logos))};
  if (fs.existsSync(destination) && !process.argv.includes('--replace-copy')) throw new Error('商品文案.json已存在；为保护人工编辑未覆盖。如需重建，请先备份并使用 --replace-copy');
  fs.writeFileSync(destination + '.tmp', JSON.stringify(result, null, 2), 'utf8');
  fs.renameSync(destination + '.tmp', destination);
  fs.writeFileSync(compatibility, JSON.stringify(result, null, 2), 'utf8');
  console.log('商品文案.json已生成：' + products.length + '项；原始目录与快照未改动。');
  return result;
}

if (require.main === module) build();
module.exports = {build, classify, formatProduct};

