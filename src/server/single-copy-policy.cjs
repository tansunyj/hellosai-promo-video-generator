const rules = require('../../data/single-product/merchant-rules.cjs');
const {emphasizeValue} = require('./single-value-proposition.cjs');
const {merchandiseCopy} = require('./single-merchandising.cjs');

function enforceStoryPolicy(story, info) {
  if (rules.brands[info.brand]?.warranty !== 'none') return story;
  const value = {...story};
  const warranty = {title: '不提供质保', detail: 'Claude不参与质保；存在封号风险，不承诺防封或恢复'};
  const promises = /质保|售后|不封|防封|掉线|稳定|包赔|永久可用/;
  const unsafeClaim = text => promises.test(String(text || '').replace(/不提供质保|不参与质保|无质保|不承诺防封|不承诺免封/g, ''));
  const replacements = {
    productTitle: info.shortTitle, hookTitle: 'Claude方案，先看风险再决定',
    hookSubtitle: '使用存在封号风险，购买前先了解无质保条款',
    hookAnswer: '按约定提供对应服务，不提供Claude质保',
    offerSubtitle: '按约定交付；Claude不参与质保，存在封号风险',
    processSubtitle: '核对服务范围，接受无质保后再办理',
    hookPayoff: '核对实际交付；Claude无质保，不承诺免封',
    ctaTitle: '先把风险看清，再决定是否购买。',
    ctaButton: '看主页简介 · 了解Claude方案',
    ctaNote: 'Claude无质保，不承诺防封或恢复账号'
  };
  Object.assign(replacements, {offerScene: '想了解对应Claude服务及风险', reasonsTitle: '服务内容与无质保边界', processTitle: '核对风险后，按说明办理'});
  for (const [field, replacement] of Object.entries(replacements)) {
    if (unsafeClaim(value[field])) value[field] = replacement;
  }
  value.points = (value.points || []).map((point, index) => index === 2 ? warranty : promises.test(point.title + point.detail) ? {title: index ? '按标注规格核对' : '核对服务范围', detail: index ? '核对实际套餐、周期与交付内容' : '仅办理约定服务，不承诺注册或审核成功'} : point);
  value.steps = (value.steps || []).map(step => unsafeClaim(step) ? '接受无质保再办理' : step);
  value.stepDetails = (value.stepDetails || []).map(detail => unsafeClaim(detail) ? 'Claude无质保，存在封号风险，接受后再办理' : detail);
  value.serviceBoundary = rules.brands.Claude.risk;
  value.offerEvidence = value.points.map(point => point.title).join(' · ');
  value.disclaimer = 'Claude不参与质保，存在封号风险；参考价、期限与交付以页面为准';
  return value;
}

function specializeCopy(copy, product, info) {
  const story = {...copy.story, points: copy.story.points.map(point => ({...point}))};
  const title = info.title;
  const account = ['account', 'paid-account'].includes(copy.profile);
  if (copy.profile === 'rental') story.points[0] = {title: '限期使用权', detail: '租用不代表账号买断；核对期限与约定用途'};
  if (info.brand === 'Google' && account) story.points[0] = {title: '现成邮箱交付', detail: '减少自行注册准备；登录与验证条件仍须核对'};
  if (info.brand === 'Muse' && account) story.points[0] = {title: '减少注册准备', detail: '交付现成账号，不把普通账号包装成付费会员'};
  if (info.brand === 'Grok' && copy.profile === 'paid-account') story.points[0] = {title: '含套餐账号交付', detail: '交付后核对实际套餐，减少自行办理订阅支付'};
  if (['Gemini', '多邻国'].includes(info.brand) && /budget/.test(copy.evidence?.scenario || '')) {
    story.points[0] = {title: '先看参考预算', detail: String(product.price || '价格见商品页') + '对应本商品，不代表官方同规格套餐'};
    story.points[1] = {title: '核对实际权益', detail: info.duration ? '原商品标注' + info.duration + '；适用条件和实际期限须核对' : '确认实际档位、适用资格与有效期'};
  }
  if (/无质保|不质保|无售后/.test(title)) story.points[2] = {title: '无质保须知', detail: '原商品明确无质保或无售后，接受边界后再购买'};
  else if (/只保激活/.test(title)) story.points[2] = {title: '仅保障激活', detail: '原商品只保激活，不保障后续使用时长'};
  else if (/首登/.test(title)) story.points[2] = {title: '首登范围核对', detail: '原商品仅标注首登相关保障，不等于长期质保'};
  else if (/售后.{0,6}1个?小时/.test(title)) story.points[2] = {title: '售后时限须知', detail: '原商品标注售后1小时，先核对起算点与举证要求'};
  if (/1小时(?:内使用|后过期)/.test(title)) {
    story.points[1] = {title: '链接限时使用', detail: '原商品注明1小时使用或过期限制，收货后按说明操作'};
    story.stepDetails = [...story.stepDetails]; story.stepDetails[2] = '核对链接使用时限，按说明兑换并验收权益';
  }
  if (copy.evidence?.merchantRule) story.scenarioBasis = '商家2026-10-24反馈：' + copy.evidence.merchantRule.blocker + '；实际适用条件需核对';
  story.offerEvidence = story.points.map(point => point.title).join(' · ');
  const valueCopy = merchandiseCopy(emphasizeValue({...copy, story}, product, info), product, info);
  const revised = valueCopy.story;
  if (/无质保|不质保|无售后/.test(title)) revised.points[2] = {title: '无质保或售后', detail: '原商品注明无质保或无售后，不能当作长期保障'};
  else if (/只保激活/.test(title)) revised.points[2] = {title: '只保激活', detail: '仅保障激活，不承诺后续可用时长'};
  else if (/首登/.test(title)) revised.points[2] = {title: '仅限首登范围', detail: '原名首登保障不等于长期可用或后续订阅保障'};
  else if (/售后.{0,6}1个?小时/.test(title)) revised.points[2] = {title: '售后仅1小时', detail: '核对售后起算点；原名要求提前录屏的须按说明留证'};
  else if (/保订阅不包封号/.test(title)) revised.points[2] = {title: '保订阅不保封号', detail: '订阅保障和账号风控不同，不承诺防封或恢复'};
  else {
    const coverage = title.match(/(?:质保|双质保|超长质保)(?:订阅)?\s*(\d+个?月|一个月|\d+天)/)?.[1];
    if (coverage) revised.points[2] = {title: '标注' + coverage + '保障', detail: '原名标注质保' + coverage + '，覆盖内容与生效条件需对应'};
  }
  if (/1小时(?:内使用|后过期)/.test(title)) {
    revised.points[1] = {title: '链接1小时内用', detail: '原商品注明1小时使用或过期限制，不能拖到以后使用'};
    revised.stepDetails = [...revised.stepDetails];
    revised.stepDetails[2] = '收到后注意1小时限制，按说明兑换并核对实际权益';
  }
  if (info.brand === 'Grok' && info.type === 'paid-account') {
    revised.hookTitle = 'Grok成品号' + product.price + '，包含什么？';
    revised.hookSubtitle = '想用对应套餐，又想少折腾注册和订阅支付？';
    valueCopy.evidence.sellingAngle = 'price-and-convenience';
  }
  if (['Gemini', '多邻国'].includes(info.brand) && info.type === 'paid-account') {
    revised.hookTitle = info.brand + '成品号只要' + product.price + '？';
    revised.hookSubtitle = '想控制订阅预算，又不想自己准备账号？';
    revised.points[0] = {title: '参考价' + product.price, detail: '对应本款含套餐账号，低预算也要核对权益与使用条件'};
    valueCopy.evidence.sellingAngle = 'price-and-convenience';
  }
  revised.scenarioBasis = '商品原名：' + (title.length <= 140 ? title : '详见保留的originalProduct.rawTitle') + '；卡点为候选用户场景，需商家核实';
  revised.scenarioAudience = '有' + (info.brand || info.kind) + '相关需求，且符合商品实际条件的用户';
  revised.serviceBoundary = info.type === 'verification' ? '仅指定项目收码，不提供身份资料、不代替实名或人脸核验' : info.type === 'usage-credit' ? '仅Codex使用点数，非API额度，也不是会员订阅' : info.type === 'privacy-mail' ? '仅约定收件用途，不默认包含完整邮箱或iCloud账号权限' : info.type === 'rental' ? '仅限约定期限的使用权，不是买断或教育身份认证' : '只交付原商品明确的' + info.kind + '；不承诺额外权益、绕过审核或永久可用';
  if (info.blocked) {
    revised.ctaTitle = '这款先核实信息，再考虑下单。';
    revised.ctaButton = '先看说明 · 确认适用条件';
    revised.ctaNote = info.issues.find(issue => /禁止|必须|未明确|需核实/.test(issue)) || '缺少关键信息，不直接投放';
  }
  if (/活动已结束|请勿下单|已下架/.test(title)) {
    revised.hookTitle = '活动已结束，这款先别下单';
    revised.hookSubtitle = '原商品已注明停售，不能继续宣传可领取';
    revised.hookAnswer = '等待确认活动恢复或选择其他有效方案';
    revised.hookPayoff = '不把结束的活动当作可领取福利';
  }
  revised.offerEvidence = revised.points.map(point => point.title).join(' · ');
  const finalStory = enforceStoryPolicy(valueCopy.story, info);
  const chain = {...copy.chain, goal: finalStory.offerScene, blocker: finalStory.hookSubtitle, solution: finalStory.hookAnswer, mechanism: finalStory.offerSubtitle, steps: finalStory.steps, stepDetails: finalStory.stepDetails, result: finalStory.hookPayoff};
  return {...valueCopy, story: finalStory, chain};
}

function sanitizeDisplayProduct(product, info) {
  return rules.brands[info.brand]?.warranty === 'none' ? {...product, label: info.kind + ' · 无质保', facts: ['不提供质保', '存在封号风险', '按约定规格交付']} : product;
}

module.exports = {specializeCopy, enforceStoryPolicy, sanitizeDisplayProduct};

