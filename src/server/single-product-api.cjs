const fs = require('node:fs');
const path = require('node:path');
const {buildDecisionFlow, normalizeStory, validateStory, getStoryNarrative} = require('./single-story-model.cjs');
const {classify} = require('../../tools/build-single-products.cjs');
const {createCopywriting} = require('./single-copywriting.cjs');
const {enforceStoryPolicy, sanitizeDisplayProduct} = require('./single-copy-policy.cjs');
const root = path.resolve(__dirname, '..', '..');
const filename = path.join(root, 'public', '商品文案.json');

function readSingleProducts() {
  const catalog = JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.products)) throw new Error('单品数据格式不正确，请运行 npm run prepare:single');
  return {...catalog, products: catalog.products.map(product => {
    const original = product.originalProduct || product;
    const info = classify(original);
    const recommended = createCopywriting(original, info);
    const saved = {...product.story};
    if ((product.copywriting?.version || 0) < 4) {
      const chain = product.copywriting?.chain || {};
      const linked = {offerScene: 'goal', hookSubtitle: 'blocker', hookAnswer: 'solution', offerSubtitle: 'mechanism', processSubtitle: 'solution', hookPayoff: 'result', steps: 'steps', stepDetails: 'stepDetails'};
      for (const [field, key] of Object.entries(linked)) {
        if (chain[key] !== undefined && JSON.stringify(saved[field]) === JSON.stringify(chain[key])) saved[field] = recommended.story[field];
      }
      if (product.copywriting?.hookOptions?.includes(saved.hookTitle)) saved.hookTitle = recommended.story.hookTitle;
      saved.confirmed = false;
    }
    const story = normalizeStory(enforceStoryPolicy(normalizeStory(saved, recommended.story), info));
    const recommendedStory = normalizeStory({...story, ...recommended.story, confirmed: false});
    return {...product, product: sanitizeDisplayProduct(product.product, info), story, recommendedStory, recommendedHookOptions: recommended.hookOptions, copywriting: {...product.copywriting, version: 10, evidence: recommended.evidence, hookOptions: recommended.hookOptions, chain: getStoryNarrative(story), decisionFlow: buildDecisionFlow(story, product.product)}};
  })};
}

function mediaAsset(folder, value, pattern) {
  if (!value) return null;
  if (typeof value !== 'string' || path.basename(value) !== value || !pattern.test(value)) throw new Error('素材名称不合法');
  const filename = path.join(root, 'public', 'assets', folder, value);
  if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) throw new Error('所选素材已不存在，请刷新素材列表');
  return 'assets/' + folder + '/' + value;
}

function prepareSingleInput(data, exporting = false) {
  const catalog = readSingleProducts();
  const selected = catalog.products.find(product => product.id === Number(data.productId));
  if (!selected) throw new Error('请从单品数据目录选择一个有效商品');
  const info = classify(selected.originalProduct || selected);
  const story = normalizeStory(enforceStoryPolicy(normalizeStory(data.story, selected.story), info));
  if (exporting) {
    const errors = validateStory(story);
    if (selected.stockStatus !== 'available' && data.allowUnavailable !== true) errors.push('快照库存缺货或未知，请先核对，并明确勾选允许展示');
    if (selected.review.warnings.some(warning => /停止销售/.test(warning)) && data.allowUnavailable !== true) errors.push('原商品包含停止销售提示，必须人工确认后再展示');
    if (errors.length) throw new Error(errors.join('；'));
  }
  return {
    products: [{...selected.product, title: story.productTitle}],
    renderConfig: {background: mediaAsset('background', data.background, /\.(png|jpe?g|webp)$/i), bgm: mediaAsset('bgm', data.bgm, /\.(mp3|wav|m4a)$/i)},
    videoConfig: {template: 'single_story', outroBrand: story.brand, showStoreUrl: false, showFollowHint: true, durationMode: 'auto'},
    singleStory: story,
    singleSource: {catalog: 'public/商品文案.json', copywriting: {...selected.copywriting, chain: getStoryNarrative(story)}, scenarioReview: {audience: story.scenarioAudience, basis: story.scenarioBasis, boundary: story.serviceBoundary, confirmed: story.confirmed}, generatedAt: catalog.generatedAt, ...selected.source, review: selected.review, stock: selected.stock, stockStatus: selected.stockStatus, allowUnavailable: data.allowUnavailable === true}
  };
}

module.exports = {readSingleProducts, prepareSingleInput};

