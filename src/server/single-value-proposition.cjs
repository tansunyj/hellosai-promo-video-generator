const prices = require('../../data/single-product/official-price-references.cjs');

function officialReference(info, now = Date.now()) {
  const title = info.title;
  const key = info.brand === 'Gemini' && /pro/i.test(title) ? 'geminiPro' : info.brand === '多邻国' && /super|超级会员/i.test(title) ? 'duolingoSuper' : info.brand === 'Grok' && /heavy/i.test(title) ? 'superGrokHeavy' : info.brand === 'Grok' && /supergro/i.test(title) && !/ultra/i.test(title) ? 'superGrok' : null;
  const reference = prices.references[key];
  if (!reference || reference.verified !== true || !reference.verifiedAt) return null;
  const age = now - Date.parse(reference.verifiedAt);
  return Number.isFinite(age) && age >= 0 && age <= prices.maxAgeDays * 86400000 ? reference : null;
}

function emphasizeValue(copy, product, info) {
  const money = String(product.price || '').match(/[¥￥]\s*\d+(?:\.\d+)?/)?.[0]?.replace(/\s/g, '');
  const budget = /budget/.test(copy.evidence?.scenario || '');
  const account = ['account', 'paid-account'].includes(copy.profile);
  const grokPaid = info.brand === 'Grok' && (copy.profile === 'paid-account' || copy.profile === 'recharge');
  const story = {...copy.story, points: copy.story.points.map(point => ({...point}))};
  let hooks = copy.hookOptions;
  let sellingAngle = 'service-specific';
  const reference = officialReference(info);
  if (money && (budget || grokPaid)) {
    sellingAngle = 'price-first';
    const name = info.brand;
    const delivery = copy.profile === 'redemption' ? '兑换方案' : account ? '成品号' : copy.profile === 'recharge' ? '充值方案' : '权益方案';
    story.hookTitle = name + (account ? '成品号' : '套餐') + '只要' + money + '？';
    story.hookSubtitle = budget ? '官方常规订阅嫌贵？先看这份低预算方案' : '想用对应套餐，又想少折腾订阅支付？';
    story.offerScene = '想用' + name + '对应权益，先把预算降下来';
    story.hookAnswer = '这份' + delivery + '只要' + money + '，按商品条件办理';
    story.offerSubtitle = (info.duration ? '标注' + info.duration + '的' : '') + delivery + '，本商品参考价' + money;
    story.reasonsTitle = '便宜在哪，怎么买，直接说';
    story.points[0] = {title: ('只要' + money).length <= 12 ? '只要' + money : '本商品报价', detail: delivery + '参考价' + money + '，不是统一月费或任意账号通用价'};
    if (reference) story.hookSubtitle = reference.quote + '；看看这份低预算方案';
    story.ctaTitle = '想少花这笔预算？方案在这里。';
    story.ctaButton = '看主页简介 · 选省钱方案';
    story.ctaNote = '按实际权益、期限和适用条件选择';
    story.hookPayoff = '按实际生效权益验收，不把低价当无条件承诺';
    story.processSubtitle = '选对应方案，按交付说明办理';
    hooks = [story.hookTitle, name + '不想花大钱？先看这份报价', name + '这份方案，' + money + '够不够？'];
    if (reference) story.disclaimer = '官方常规价仅作参考，条件可能不同；本品期限、权益及售后以页面为准';
  } else if (account && !['Claude'].includes(info.brand)) {
    sellingAngle = 'convenience-first';
    const name = info.brand === 'Google' ? 'Gmail' : info.brand || '账号';
    const raw = info.title;
    const recorded = [/手机号|手机验证|短信|验证码|接马|接码/.test(raw) ? '收码' : '', /扫码/.test(raw) ? '扫码' : '', /刷脸|人脸/.test(raw) ? '人脸验证' : ''].filter(Boolean);
    const registrationStep = info.brand === 'Google' ? '手机验证' : recorded.join('、');
    story.hookTitle = registrationStep ? name + '注册卡在验证？现成号更省事' : name + '注册太折腾？直接选成品号';
    story.hookSubtitle = registrationStep ? '如果卡在' + registrationStep + '，可先了解现成账号交付' : '不想反复准备注册资料？现成账号少走准备流程';
    story.hookAnswer = '选这款现成账号，减少自行注册准备';
    story.offerSubtitle = money ? '这款账号参考价' + money + '；按交付说明登录' : '按约定规格交付现成账号，再按说明登录';
    story.points[0] = {title: '少折腾注册准备', detail: '现成账号按说明交付；后续验证仍按平台规则完成'};
    story.ctaTitle = '少折腾账号准备，把时间用在正事上。';
    story.ctaButton = '看主页简介 · 选现成账号';
    story.ctaNote = '不承诺免扫码、免刷脸或绕过身份审核';
    hooks = [story.hookTitle, name + '现成账号，省去哪些准备？'];
  }
  story.offerEvidence = story.points.map(point => point.title).join(' · ');
  return {...copy, story, hookOptions: hooks, evidence: {...copy.evidence, sellingAngle, officialReference: reference ? {...reference, published: true, note: prices.scopeNote} : {published: false, status: 'missing-or-unverified-or-stale'}}};
}

module.exports = {emphasizeValue, officialReference};

