const rules = require('../../data/single-product/merchant-rules.cjs');

function brandScenario(product, info, profile) {
  const brand = info.brand;
  const account = ['account', 'paid-account'].includes(profile.key);
  const recharge = profile.key === 'recharge';
  const verification = profile.key === 'verification';
  let copy = {};
  let scenario = profile.key;
  if (info.kind === '租用方案') {
    scenario = 'limited-rental';
    copy = {key: 'rental', goal: '只想短期使用，不想误买完整账号', question: '这是短期租用，不是永久账号',
      alternatives: ['只租用几天，先看清使用权限', '买的是使用权，还是完整账号？'],
      problem: '只需要短期使用，却容易把租用当账号买断？', solution: '按商品标注租用对应使用权',
      mechanism: '只交付约定期间与范围的使用权限，不承诺账号所有权',
      pointsTitle: '租多久、能做什么，先说清',
      steps: ['确认租用期限', '核对用途与权限范围', '按说明使用并核对到期'],
      stepDetails: ['核对标注周期，不把短期权限当长期账号', '仅按真实资格及约定用途使用', '到期和续用方式提前确认，不保证额外权益'],
      result: '拿到的是约定使用权，不是永久账号', ending: '短期需求，先把使用范围看清。',
      button: '看主页简介 · 了解租用范围', ctaNote: '租用期限、用途和售后先确认'};
  } else if (brand === 'Google' && account) {
    scenario = 'gmail-registration-account';
    copy = {goal: '想准备Gmail邮箱，用于日常收信与工具注册', question: '想用Gmail，注册这步总卡住？',
      alternatives: ['Gmail注册不顺，邮箱怎么准备？', '需要谷歌邮箱，不想反复注册？'],
      problem: '需要谷歌邮箱，却反复卡在注册或验证？', solution: '选这款现成邮箱，减少自行注册准备',
      mechanism: '按商品规格交付邮箱；登录方式和使用范围先核对',
      pointsTitle: '拿到邮箱前，这三项要对清',
      steps: ['选择邮箱规格', '核对登录与使用范围', '下单后按说明登录'],
      stepDetails: ['确认个人邮箱、地区及账号类型', '确认验证方式和找回资料，不承诺免验证', '核对邮箱收发；不代表包含付费订阅'],
      result: '核对邮箱登录与收发，不包含额外付费会员', ending: '邮箱准备好了，再开始你的任务。',
      button: '看主页简介 · 查看邮箱方案', ctaNote: '先说邮箱用途，再选对应规格'};
  } else if (brand === 'Muse' && account) {
    scenario = 'muse-ready-account';
    copy = {goal: '想开始用Muse，不想反复准备注册资料', question: 'Muse注册太折腾，想省点事？',
      alternatives: ['想用Muse，不想从注册开始折腾？', 'Muse成品号，省在哪一步？'],
      problem: '想开始使用，却把时间耗在账号注册上？', solution: '选择Muse成品号，减少自行注册准备',
      mechanism: '交付现成账号，按说明登录；不保证免除后续验证',
      pointsTitle: '少折腾注册，不等于省略核对',
      steps: ['选Muse账号规格', '确认交付与登录条件', '下单并核对账号登录'],
      stepDetails: ['确认是否含订阅，不把普通号当会员号', '问清交付内容、使用限制和售后范围', '按交付说明登录，核对实际所含权益'],
      result: '能否登录及包含哪些权益，逐项核对', ending: '把时间留给使用，少折腾账号准备。',
      button: '看主页简介 · 查看Muse账号', ctaNote: '普通账号与含订阅账号，先分清再选'};
  } else if (brand === 'Grok' && account) {
    scenario = profile.key === 'paid-account' ? 'grok-paid-ready' : 'grok-basic-account';
    copy = profile.key === 'paid-account' ? {
      goal: '想用Grok付费套餐，不想反复折腾订阅支付', question: 'Grok注册好了，付款又卡住？',
      alternatives: ['想用Grok套餐，支付却很麻烦？', 'Grok成品号，先看包含什么套餐'],
      problem: '账号注册不等于订阅开通，支付办理仍费心？', solution: '看看这款标注含套餐的Grok成品号',
      mechanism: '按约定交付含套餐账号，登录后核对权益与期限',
      pointsTitle: '成品号，重点看这三项',
      steps: ['选含套餐账号', '核对套餐与售后范围', '收取账号并验收权益'],
      stepDetails: ['确认具体档位、周期和地区条件', '分清首登保障与长期使用保障', '按说明登录，核对实际套餐和到期日'],
      result: '核对已含套餐，不把账号交付当永久保障', ending: '少折腾支付，先对清套餐与交付。',
      button: '看主页简介 · 查看Grok套餐号', ctaNote: '按实际套餐和交付说明选择'
    } : {question: 'Grok普通号，含付费订阅吗？', problem: '想用付费套餐，别把普通账号当会员',
      solution: '这款只解决账号准备，不代替开通订阅', mechanism: '普通号按规格交付，付费套餐须另行确认',
      result: '登录账号不代表已经开通付费套餐'};
  } else if (brand === 'Grok' && recharge) {
    scenario = 'grok-payment-recharge';
    copy = {goal: '已有Grok账号，想开通对应订阅', question: 'Grok账号有了，订阅付款难办？',
      problem: '卡在订阅支付，不想重新买一个账号？', solution: '用这款充值方案，对接已有账号',
      mechanism: '核对账号、套餐与地区条件后，按约定对接充值', result: '完成后到自己账号核对套餐与有效期'};
  }
  if (brand === 'Claude') {
    scenario = recharge ? 'claude-existing-recharge' : account ? 'claude-registration-account' : verification ? 'claude-code-only' : 'claude-reviewed-service';
    if (account) copy = {goal: '想用Claude，先准备适用账号', question: '想用Claude，却卡在账号注册？',
      alternatives: ['Claude注册受阻，账号怎么准备？', 'Claude成品号，买之前先看风险'],
      problem: '自己注册不顺，又想减少账号准备步骤？', solution: '这款Claude账号，按标注规格交付',
      mechanism: '核对账号类型再购买；无质保，不能排除封号风险',
      pointsTitle: '先看账号规格，再看风险', steps: ['分清普通号与订阅号', '接受无质保再下单', '核对账号与实际权益'],
      stepDetails: ['按商品标注核对；普通号不包含付费订阅', '本店当前口径：Claude不参与质保', '按说明登录，不保证长期可用或免验证'],
      result: '账号交付不等于免封；无质保须先接受', ending: '先把风险看清，再选Claude方案。',
      button: '看主页简介 · 了解Claude账号', ctaNote: 'Claude无质保，不承诺防封或恢复账号'};
    else if (recharge) copy = {goal: '已有Claude账号，想开通对应套餐', question: 'Claude账号有了，订阅怎么充？',
      alternatives: ['已有Claude账号，充值这步卡住？', 'Claude代充前，先看这条风险'],
      problem: '想开通套餐，但订阅支付办理不顺？', solution: '对应套餐代充，只承接已有适用账号',
      mechanism: '核对账号和充值渠道；本店不提供Claude质保',
      pointsTitle: '能充什么，风险是什么？', steps: ['核对账号与套餐', '接受无质保再下单', '充值后核对订阅状态'],
      stepDetails: ['代充不是注册服务，先确认已有账号适用', 'Claude不参与质保，不承诺免封号', '按约定办理后，核对套餐及有效期'],
      result: '核对套餐与期限，不代表免封或享有质保', ending: '先核对账号，再决定是否代充。',
      button: '看主页简介 · 了解Claude代充', ctaNote: 'Claude无质保，封号风险须先了解'};
    else if (verification) copy = {question: 'Claude注册卡在收码这一步？',
      problem: '如果当前流程需要收码，先核对是否支持', solution: '只对接约定收码环节，不保证注册成功',
      mechanism: '注册是否开放须实时确认；不代办实名或身份审核', result: '收到验证码不等于注册成功或免封'};
  }
  if (['Gemini', '多邻国'].includes(brand) && ['redemption', 'paid-account', 'subscription-review'].includes(profile.key)) {
    const name = brand;
    const price = String(product.price || '页面参考价');
    const link = /链接/.test(info.title) && !account;
    scenario = (brand === 'Gemini' ? 'gemini-budget-' : 'duolingo-budget-') + (link ? 'redemption' : account ? 'account' : 'activation');
    copy = {goal: '想用' + name + '对应权益，也想少些预算压力', question: /^[¥￥]\d+(?:\.\d+)?$/.test(price) ? name + '套餐，' + price + '能拿到什么？' : name + '会员，预算想再省一点？',
      alternatives: ['这款' + name + '方案，参考价多少？', '想用' + name + '，先看看这份预算'],
      problem: '想用对应会员权益，又不想一上来投入太多？', solution: price + '参考方案，先看权益与适用条件',
      mechanism: link ? '交付兑换或激活链接，按条件操作；不是账号代充' : account ? '按标注交付账号，核对实际已含会员权益' : '按商品说明领取权益，不承诺未标注的使用期限',
      pointsTitle: '预算之外，这三项更要看',
      steps: [link ? '确认兑换适用条件' : '确认账号或领取条件', '核对权益期限与售后', link ? '下单后按时兑换验收' : '按说明领取并核对'],
      stepDetails: ['核对地区、账号与资格，不能默认人人可用', '分清标注周期、可用期限及实际售后范围', /1小时/.test(info.title) ? '原商品注明1小时限制，购买前确认时限含义' : '按交付说明操作，核对实际生效权益'],
      result: '低预算不等于同款权益，实际条件要对清', ending: '想少花预算，也要把权益看明白。',
      button: '看主页简介 · 查看预算方案', ctaNote: '不虚报官方差价，按实际权益与期限选择'};
  }
  return {...profile, ...copy, scenario, merchantRule: rules.brands[brand] || null};
}

module.exports = {brandScenario};

