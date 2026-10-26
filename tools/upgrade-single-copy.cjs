const fs = require('node:fs');
const path = require('node:path');
const {createCopywriting} = require('../src/server/single-copywriting.cjs');
const {classify, formatProduct} = require('./build-single-products.cjs');
const {buildDecisionFlow, normalizeStory, getStoryNarrative} = require('../src/server/single-story-model.cjs');
const {enforceStoryPolicy, sanitizeDisplayProduct} = require('../src/server/single-copy-policy.cjs');

function upgrade(baselineFile) {
  if (!baselineFile) throw new Error('Pass the saved pre-upgrade generated baseline');
  const root = path.resolve(__dirname, '..');
  const filename = path.join(root, 'public', '商品文案.json');
  const catalog = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const baseline = new Map(JSON.parse(fs.readFileSync(baselineFile, 'utf8')).map(item => [item.id, item.generated]));
  if (baseline.size !== catalog.products.length || catalog.products.some(item => !baseline.has(item.id))) throw new Error('Baseline product IDs differ');
  const backup = filename + '.before-v8-' + new Date().toISOString().replace(/[:.]/g, '-') + '.bak';
  fs.copyFileSync(filename, backup, fs.constants.COPYFILE_EXCL);
  const logos = JSON.parse(fs.readFileSync(path.join(root, 'src', 'logo-assets.json'), 'utf8'));
  let preservedFields = 0;
  const linked = {offerScene: 'goal', hookSubtitle: 'blocker', hookAnswer: 'solution', offerSubtitle: 'mechanism', processSubtitle: 'solution', hookPayoff: 'result', steps: 'steps', stepDetails: 'stepDetails'};
  catalog.products = catalog.products.map((item, index) => {
    const original = item.originalProduct || item;
    const info = classify(original);
    const generated = createCopywriting(original, info);
    const formatted = formatProduct(original, index, item.source?.sha256 || catalog.source.sha256, logos);
    const old = baseline.get(item.id);
    const story = {...item.story};
    for (const [field, value] of Object.entries(generated.story)) {
      const previousChain = item.copywriting?.chain?.[linked[field]];
      const unchanged = JSON.stringify(story[field]) === JSON.stringify(old[field]) || previousChain !== undefined && JSON.stringify(story[field]) === JSON.stringify(previousChain) || field === 'hookTitle' && item.copywriting?.hookOptions?.includes(story[field]);
      if (story[field] === undefined || story[field] === '' || unchanged) story[field] = value;
      else if (JSON.stringify(story[field]) !== JSON.stringify(value)) preservedFields++;
    }
    if (story.productTitle === item.product?.title) story.productTitle = info.shortTitle;
    const finalStory = normalizeStory(enforceStoryPolicy({...story, category: info.kind, confirmed: false}, info));
    const product = sanitizeDisplayProduct(formatted.product, info);
    const warnings = [...new Set([...formatted.review.warnings.filter(warning => !/未明确服务形式/.test(warning) || generated.profile === 'needs-review'), ...info.issues])];
    if (info.brand === 'Claude') warnings.unshift('商家2026-10-24最新口径：Claude不参与质保；原名质保描述已失效，不承诺防封');
    return {...item, originalProduct: original, product, label: product.label, facts: product.facts, story: finalStory,
      copywriting: {...formatted.copywriting, version: 10, chain: getStoryNarrative(finalStory), decisionFlow: buildDecisionFlow(finalStory, product)},
      review: {...item.review, required: true, warnings}, copyUpdatedAt: new Date().toISOString()};
  });
  catalog.generatedAt = new Date().toISOString();
  catalog.copyVersion = 10;
  fs.writeFileSync(filename + '.tmp', JSON.stringify(catalog, null, 2), 'utf8');
  fs.renameSync(filename + '.tmp', filename);
  fs.writeFileSync(path.join(root, 'data', 'single-product', 'single-products.json'), JSON.stringify(catalog, null, 2), 'utf8');
  console.log(JSON.stringify({updated: catalog.products.length, preservedFields, backup}, null, 2));
}

if (require.main === module) upgrade(process.argv[2]);
module.exports = {upgrade};

