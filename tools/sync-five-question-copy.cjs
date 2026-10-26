const fs = require('node:fs');
const path = require('node:path');
const {buildDecisionFlow, getStoryNarrative} = require('../src/server/single-story-model.cjs');

const root = path.resolve(__dirname, '..');
const files = [path.join(root, 'public', '商品文案.json'), path.join(root, 'data', 'single-product', 'single-products.json')];
let total = 0;
for (const file of files) {
  const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const item of catalog.products || []) {
    item.copywriting = {
      ...item.copywriting,
      version: 10,
      chain: getStoryNarrative(item.story),
      decisionFlow: buildDecisionFlow(item.story, item.product),
      structure: ['贵不贵：页面参考价前置', '是什么：方案与服务边界', '凭什么放心：三项可核对事实', '怎么买：三步办理路径', '现在做什么：明确行动入口']
    };
  }
  catalog.copyVersion = 10;
  const temporary = file + '.v9.tmp';
  fs.writeFileSync(temporary, JSON.stringify(catalog, null, 2), 'utf8');
  fs.renameSync(temporary, file);
  total = catalog.products?.length || 0;
}
console.log(JSON.stringify({copyVersion: 10, products: total, files: files.map(file => path.relative(root, file))}, null, 2));
