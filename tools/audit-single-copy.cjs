const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {classify} = require('./build-single-products.cjs');
const {createCopywriting} = require('../src/server/single-copywriting.cjs');
const {buildDecisionFlow, normalizeStory, validateStory, getStoryNarrative} = require('../src/server/single-story-model.cjs');
const {enforceStoryPolicy} = require('../src/server/single-copy-policy.cjs');

const root = path.resolve(__dirname, '..');
const read = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const catalog = read('public/商品文案.json');
const snapshot = read('data/single-product/source-products.json');
const source = Array.isArray(snapshot) ? snapshot : snapshot.products;
const baseline = read('data/single-product/copy-v7-before-baseline.json');
const previous = new Map(baseline.map(item => [item.id, item.generated]));
const explanations = {
  recharge:'已有账号但付款卡住，卖点是对应套餐充值；按原名拆开票据、自助办理和档位。',
  account:'减少注册准备；按实际交付资料与用途选账号，普通号不包装成会员。',
  'paid-account':'账号与对应套餐一起交付，突出减少账号准备及支付步骤，不虚构长期稳定。',
  'education-account':'有资格条件的账号，需先核实真实身份与权益，不承诺通用或免审核。',
  'shared-account':'体验需求与共享形式匹配，不把共享号当独享会员。',
  verification:'只解决指定项目的收码步骤，突出单次、有效期或换号功能，不夸大成功率。',
  redemption:'参考报价前置，结合链接形式、期限及是否绑卡；不造官方同款折扣。',
  activation:'低预算领取权益，同时保留只保激活、不保时长的限制。',
  'usage-credit':'继续处理任务的额度需求，明确点数不是API余额或会员。',
  'credit-review':'有数量和价格但缺单位、用途或到账方式，不猜测成通用额度。',
  'privacy-mail':'面向收邮件与取信入口，不误导为完整iCloud账号。',
  rental:'短期使用匹配限期租用，不承诺买断或取得教育身份。',
  'team-seat':'解决加入团队的席位安排，权限、周期与个人会员分开。',
  'invitation-reward':'活动入口与奖励资格分开，不能把奖励标题当保证到账。',
  'invite-code':'邀请码只解决参与入口，不承诺所有人能拿到固定奖励。',
  eligibility:'资格与会员、身份核验与接码分开，不提供免审核或成功率承诺。',
  coupon:'卖折扣码而不是会员，范围与额外套餐费用必须分开。',
  'link-tool':'卖指定次数的工具操作，不错当团队席位或完整订阅。',
  'needs-review':'保留可确认价格，缺失交付信息先补充，不编造注册、支付解法。'
};
const errors = [];
const records = [];
assert.equal(catalog.products.length, source.length);
assert.deepEqual(fs.readFileSync(path.join(root, 'public/商品目录.json')), fs.readFileSync(path.join(root, 'data/single-product/source-products.json')));
assert.deepEqual(catalog, read('data/single-product/single-products.json'));
for (const item of catalog.products) {
  const original = source.find(product => product.id === item.id);
  const info = classify(original);
  const generated = createCopywriting(original, info);
  const before = previous.get(item.id);
  const story = item.story;
  try {
    assert.deepEqual(item.originalProduct, original, 'originalProduct must remain unchanged');
    assert.equal(item.product.price, original.price);
    assert.equal(item.copywriting.profile, info.type);
    assert.equal(item.copywriting.version, 10);
    assert.equal(item.copywriting.evidence.sellingAngle, generated.evidence.sellingAngle);
    assert.notEqual(item.copywriting.evidence.sellingAngle, 'service-specific');
    assert.deepEqual(item.copywriting.chain, getStoryNarrative(story));
    assert.deepEqual(item.copywriting.decisionFlow, buildDecisionFlow(story, item.product));
    assert.equal(item.copywriting.decisionFlow.version, 2);
    assert.ok(item.copywriting.decisionFlow.emotion?.tension?.headline);
    assert.ok(item.copywriting.decisionFlow.emotion?.reassurance?.headline);
    assert.deepEqual(Object.values(item.copywriting.decisionFlow).filter(value => value && value.question).map(value => value.question), ['贵不贵？','是什么？','凭什么放心？','怎么买？','现在做什么？']);
    assert.equal(validateStory({...story, confirmed:true}).length, 0);
    normalizeStory(story);
    assert.deepEqual(enforceStoryPolicy(story, info), story);
    if (info.brand === 'Claude') assert.equal(story.points[2].title, '不提供质保');
    if (/只保激活/.test(info.title)) assert.match(JSON.stringify(story.points), /不承诺后续可用时长/);
    if (/1小时(?:内使用|后过期)/.test(info.title)) assert.match(JSON.stringify(story.points), /1小时/);
    if (info.type === 'usage-credit') assert.match(JSON.stringify(story.points), /非API/);
    if (/未接|未过手机/.test(info.title) && ['account','paid-account'].includes(info.type)) assert.match(JSON.stringify(story.points), /未接码|未验证/);
    if (/活动已结束/.test(info.title)) assert.match(story.hookTitle, /活动已结束/);
    if (/除Codex/.test(info.title)) assert.match(JSON.stringify(story.points), /不适用于Codex/);
    if (/不包GCP/.test(info.title)) assert.match(JSON.stringify(story.points), /不包含GCP/);
    const rendered = JSON.stringify(Object.fromEntries(Object.entries(story).filter(([field]) => !['scenarioBasis','scenarioAudience','serviceBoundary'].includes(field))));
    assert.doesNotMatch(rendered.replace(/不宣传永久稳定/g, ''), /100%|99%|95%|全网最低|稳如老狗|已售千单|永久稳定|保证通过|24H秒发/);
    assert.equal(item.copywriting.evidence.officialReference?.published, false);
  } catch (error) {errors.push({id:item.id, error:error.message});}
  const oldIssues = [];
  if (/想用.*不知道从哪开始|先核对|先确认|先对|到手先核对/.test(before.hookTitle)) oldIssues.push('开头偏说明书或没有明确利益');
  if (/先对适用条件|售后先问清|规格与范围/.test(JSON.stringify(before.points))) oldIssues.push('核心位置被泛泛说明占用');
  records.push({id:item.id, rawTitle:info.title, referencePrice:original.price, offerType:info.type, angle:item.copywriting.evidence.sellingAngle, editorialDecision:explanations[info.type], oldIssues, oldHook:before.hookTitle, newHook:story.hookTitle, solution:story.hookAnswer, benefits:story.points, operation:story.steps.map((step,index) => ({step,detail:story.stepDetails[index]})), cta:{title:story.ctaTitle,button:story.ctaButton,note:story.ctaNote}, requiredReview:info.issues, status:info.blocked ? 'needs-information' : 'merchant-review', changedFields:Object.keys(generated.story).filter(field => JSON.stringify(before[field]) !== JSON.stringify(story[field])), source:{id:original.id,titleField:'originalProduct.rawTitle',priceField:'originalProduct.price'}, guarantee:'文案不构成效果、平台审核或免封保证'});
}
const byId = new Map(catalog.products.map(item => [item.id, item]));
for (const [id,type] of [[35,'account'],[37,'privacy-mail'],[43,'account'],[63,'account'],[66,'account'],[68,'usage-credit'],[76,'activation'],[79,'account'],[84,'invitation-reward'],[97,'account'],[104,'eligibility'],[107,'account'],[111,'shared-account'],[125,'paid-account'],[147,'coupon'],[148,'link-tool'],[155,'account']]) {
  if (byId.get(id).copywriting.profile !== type) errors.push({id,error:'Expected type '+type});
}
const group = key => records.reduce((counts,item) => ({...counts,[item[key]]:(counts[item[key]] || 0)+1}), {});
const report = {version:10, generatedAt:new Date().toISOString(), scope:'153项逐商品源数据与五幕文案检查；不是实时价格、库存或平台政策核验', methods:['五问决策漏斗：贵不贵、是什么、凭什么放心、怎么买、现在做什么', 'content-risk-detector：证据、误导宣传与承诺边界'], total:records.length, changed:records.filter(item => item.changedFields.length).length, types:group('offerType'), angles:group('angle'), statuses:group('status'), errors, products:records};
if (errors.length) {console.error(JSON.stringify({errors},null,2)); process.exitCode=1;}
if (process.argv.includes('--write') && !errors.length) {
  const directory = path.join(root, 'docs');
  const filename = path.join(directory, 'SINGLE_PRODUCT_COPY_AUDIT_V10');
  fs.writeFileSync(filename+'.json', JSON.stringify(report,null,2),'utf8');
  const escape = value => String(value).replace(/\|/g,'／').replace(/[\r\n]+/g,' ');
  const lines = ['# 全商品文案审查 V10', '', '覆盖 '+report.total+' 项，修改 '+report.changed+' 项。'+report.scope+'。', '', '所有稿件仍需商家核对；needs-information 为缺信息、资格或有效期待核实，不应直接投放。未发布未经核实的官方原价、同款折扣、绝对成功率或防封承诺。', '', '## 分类与发布前核对', '', ...Object.entries(report.types).map(([type,count]) => '- '+type+'：'+count+' 项'), '', '## 需要优先核实', '', ...records.filter(item => item.status==='needs-information').map(item => '- #'+item.id+' '+item.rawTitle+'：'+item.requiredReview.join('；')), '', '## 逐商品审稿', '', '| ID | 原商品 | 报价 | 主卖点与改稿依据 | 新开场 | 解法 | 需保留的边界 |', '| --- | --- | --- | --- | --- | --- | --- |', ...records.map(item => '| '+[item.id,item.rawTitle,item.referencePrice,item.editorialDecision,item.newHook,item.solution,item.requiredReview.join('；') || '按源数据交付，商家确认后发布'].map(escape).join(' | ')+' |'), '', '完整五幕字段、修改项和来源依据见同名 JSON；不保证曝光、成交或平台审核结果。'];
  fs.writeFileSync(filename+'.md',lines.join('\n'),'utf8');
}
console.log(JSON.stringify({total:report.total,changed:report.changed,types:report.types,statuses:report.statuses,errors:errors.length},null,2));

