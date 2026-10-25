const {localizeScenario} = require('./single-local-scenario.cjs');
const {specializeCopy} = require('./single-copy-policy.cjs');

function createCopywriting(product, info) {
  const title = info.title;
  const name = info.brand || product.category || '这个工具';
  const verification = info.kind === '验证服务';
  const qualification = /资格|认证|教育/.test(title);
  const account = !verification && info.kind === '账号方案';
  const redemption = info.kind === '兑换方案';
  const recharge = info.kind === '充值方案';
  const paidAccount = account && /Plus|Pro|Max|Ultra|Super/i.test(title) && !/free|白号|资格/i.test(title);
  const target = name + (info.tier ? ' ' + info.tier : '');
  let profile = {
    key: 'needs-review', goal: '想使用' + name,
    question: '想用' + name + '，不知道从哪开始？',
    alternatives: ['想用' + name + '，这款能帮上忙吗？', '准备使用' + name + '，还差哪一步？'],
    problem: '你卡在开通、账号，还是使用条件？', solution: '先确认这款商品提供什么',
    mechanism: '服务类型未识别，先由店铺确认能否承接',
    result: '确认对应服务后，再按说明办理',
    pointsTitle: '服务内容，先对上需求。',
    steps: ['说明你遇到的卡点', '确认商品能否承接', '按确认后的流程办理'],
    stepDetails: ['先说明要用什么、卡在哪一步', '由店铺确认服务类型和适用条件', '范围、费用和交付方式确认后再下单'],
    ending: '把卡点说清，再找对应方案。', button: '看主页简介 · 咨询对应服务',
    ctaNote: '说明你想用什么、卡在哪一步'
  };
  if (verification) profile = {
    key: 'verification', goal: '想注册' + name,
    question: name + '注册，卡在收验证码？',
    alternatives: ['注册' + name + '，验证码这步没过？', '想注册' + name + '，接码怎么办？'],
    problem: '注册要收验证码，手头没有合适号码？', solution: '注册接码服务，解决这一步',
    mechanism: '先确认支持的用途，再按服务说明接收验证码',
    result: '仅办理收码环节，不代替身份审核', pointsTitle: '接码解决什么，不解决什么？',
    steps: ['确认注册项目', '核对接码条件并下单', '按说明完成收码'],
    stepDetails: ['说明要注册哪个服务、用于哪一步', '确认支持项目、地区、次数和有效期', '按约定流程操作；身份审核另行处理'],
    ending: '卡在收码，就对接接码服务。', button: '看主页简介 · 咨询接码',
    ctaNote: '先说注册项目，再确认能否接码'
  };
  else if (qualification) profile = {...profile, key: 'eligibility', goal: '想使用' + name + '的资格类方案',
    question: '想用优惠方案，资格条件符合吗？',
    alternatives: ['想用' + name + '，认证这步怎么做？', '有资格才能用，这款适合你吗？'],
    problem: '资格或认证条件没确认，不能直接当会员买', solution: '先核对资格类商品的办理范围',
    mechanism: '只按真实资格与商品规则办理，不承诺绕过审核',
    result: '确认资格有效后，按商品说明操作',
    steps: ['说明真实资格', '确认适用条件', '按规则办理或兑换'],
    stepDetails: ['如实说明账号和资格情况', '确认是否符合该商品的条件', '不得冒用资格或将资格误当会员'],
    ending: '符合条件，再办理对应方案。'};
  else if (recharge) profile = {
    key: 'recharge', goal: '想开通' + target,
    question: '想开通' + name + '，充值卡住了？',
    alternatives: ['想订阅' + name + '，没有支付方式？', name + '账号有了，会员怎么充？'],
    problem: '账号已有，没有可用的订阅支付方式？', solution: name + '代充，对接充值这一步',
    mechanism: '确认适用账号和渠道后，店铺按约定对接充值',
    result: '交付后核对订阅状态与有效期', pointsTitle: '代充这一步，先说清。',
    steps: ['选套餐并核对账号', '确认渠道后下单', '对接充值并验收'],
    stepDetails: ['说明目标套餐，先确认账号是否适用', '确认渠道、费用、期限和售后再下单', '按约定完成对接，核对订阅状态与有效期'],
    ending: '充值这一步，找杰哥对接。', button: '看主页简介 · 咨询代充',
    ctaNote: '说清套餐和账号情况，先确认能否代充'
  };
  else if (redemption) profile = {
    key: 'redemption', goal: '想开通' + target,
    question: '想开通' + name + '，还没找到入口？',
    alternatives: [name + '会员，能用兑换链接吗？', '想用' + name + '，兑换这步怎么做？'],
    problem: '想开通对应权益，还没准备好兑换链接？', solution: '购买兑换链接，按说明兑换',
    mechanism: '先核对账号与兑换条件，再用交付链接操作',
    result: '兑换后核对权益是否生效', pointsTitle: '这条链接，怎么用在你账号？',
    steps: ['核对兑换条件', '下单获取链接', '按说明兑换并验收'],
    stepDetails: ['确认地区、账号和兑换资格是否适用', '确认规格、期限和售后后购买链接', '按交付说明操作，核对权益和有效期'],
    ending: '兑换这一步，先拿对链接。', button: '看主页简介 · 了解兑换方案',
    ctaNote: '说明你的账号情况，先确认链接是否适用'
  };
  else if (account) profile = {
    key: paidAccount ? 'paid-account' : 'account', goal: '想使用' + target,
    question: '想用' + name + '，还没准备好账号？',
    alternatives: ['想用' + name + '，卡在注册这一步？', name + '想开始用，账号怎么办？'],
    problem: '注册或验证卡住，手头还没有可用账号？',
    solution: /成品号/.test(title) ? name + '成品号，交付后按说明登录' : name + '账号，按商品规格交付',
    mechanism: '购买现成账号，交付后按说明登录',
    result: paidAccount ? '登录后核对账号和已含订阅权益' : '普通账号不等于付费会员',
    pointsTitle: '账号交付，具体拿到什么？',
    steps: ['选择账号规格', '确认条件后下单', '收取交付并核对登录'],
    stepDetails: ['确认账号类型、地区及是否包含付费权益', '确认交付、使用限制和售后范围', '按交付说明登录，核对账号及所含权益'],
    ending: '账号准备这一步，找杰哥对接。', button: '看主页简介 · 咨询账号',
    ctaNote: '先说明要普通账号，还是含订阅的成品号'
  };
  else if (/Business|team/i.test(title)) profile = {...profile, key: 'team-seat', goal: '想加入' + name + '团队席位',
    question: '想用团队版，席位还没安排好？',
    alternatives: ['想加入' + name + '团队，席位怎么办？', '团队版想开始用，还差一个席位？'],
    problem: '已经需要团队版，但还没有可用席位？', solution: '选择团队席位类商品',
    mechanism: '先确认加入条件，再按交付流程安排席位', result: '交付后核对席位与使用期限',
    steps: ['确认席位与期限', '核对加入条件后下单', '按交付流程核对席位'],
    stepDetails: ['分清团队席位和个人独立订阅', '确认账号、加入方式及售后范围', '按约定交付，核对席位和使用周期'],
    ending: '席位这一步，找杰哥对接。', button: '看主页简介 · 咨询席位'};
  else if (/会员|订阅|套餐|月卡|周卡/.test(title)) profile = {...profile, key: 'subscription-review', goal: '想开通' + target,
    question: '想开通' + name + '，办理方式没弄懂？',
    alternatives: ['想订阅' + name + '，该怎么开通？', name + '会员，先确认怎么交付？'],
    problem: '想开通会员，还不清楚这款的办理方式？', solution: '联系店铺确认这款订阅如何交付',
    mechanism: '原清单未明确交付形式，不直接当代充或成品号宣传',
    steps: ['说明目标套餐', '确认交付方式后下单', '按说明办理并验收'],
    stepDetails: ['说明要开通的会员或套餐', '先确认是充值、兑换还是账号交付', '按确认后的交付方式核对实际权益'],
    ending: '开通这一步，先确认办理方式。'};

  profile = localizeScenario(product, info, profile);
  const period = info.duration;
  const warranty = title.match(/质保(?:订阅)?\s*(\d+)\s*天/);
  const monthWarranty = title.match(/质保(?:订阅)?\s*(一个月|\d+个月)/);
  const noWarranty = /无质保|不质保/.test(title);
  const points = [];
  if (verification) points.push({title: '注册收码', detail: '确认支持项目后办理收码，不含身份审核'});
  else if (redemption) points.push({title: '链接型交付', detail: /礼品链接/.test(title) ? '原清单为礼品链接，先核对兑换条件' : '原清单为兑换或激活链接，先核对适用条件'});
  else if (account) points.push({title: /成品号/.test(title) ? '成品账号交付' : '账号交付', detail: paidAccount ? '交付后核对登录及套餐权益，不保证免审核' : '交付后按说明登录，普通号不含付费订阅'});
  else if (recharge) points.push({title: '代充对接', detail: '先确认账号与渠道，按约定办理充值'});
  else points.push({title: '先对适用条件', detail: '资格、地区和使用方式，确认后再选'});
  points.push(period ? {title: period + '方案', detail: /月卡|一个月|^1个月?$/.test(period) ? '按月安排使用，先从自己的需求出发' : '让套餐周期，匹配你的使用计划'} : {title: '规格与范围', detail: verification ? '确认支持项目、地区、次数和有效期' : '确认具体规格、权益范围和有效期'});
  points.push(noWarranty ? {title: '无质保须知', detail: '原清单明确无质保，能否接受先想清'} : warranty ? {title: '质保' + warranty[1] + '天', detail: '原清单包含质保服务；具体范围见详情'} : monthWarranty ? {title: '质保' + monthWarranty[1], detail: '原清单包含质保服务；具体范围见详情'} : /质保首登/.test(title) ? {title: '首登质保', detail: '首登不等于长期质保，边界需确认'} : {title: '售后先问清', detail: '是否有质保、覆盖什么，先问再决定'});
  const disclaimer = verification ? '注册验证服务不含会员订阅；价格、适用范围以商品页面为准' : noWarranty ? '原清单注明无质保；参考价格、条件与交付以商品页面为准' : '页面参考价；适用条件、交付、库存和售后以商品页面为准';
  const chain = {goal: profile.goal, blocker: profile.problem, question: '怎么办？', solution: profile.solution, mechanism: profile.mechanism, steps: profile.steps, stepDetails: profile.stepDetails, result: profile.result, blockerType: '目标用户场景假设，需商家核对，不代表所有用户都遇到'};
  return specializeCopy({profile: profile.key, chain, evidence: profile.evidence, hookOptions: [profile.question, ...profile.alternatives],
    story: {scenarioAudience: profile.audience, scenarioBasis: '', serviceBoundary: profile.boundary, hookQuestion: '怎么办？', hookTitle: profile.question, hookSubtitle: profile.problem, hookAnswer: profile.solution, hookPayoff: profile.result,
      offerSubtitle: profile.mechanism, offerScene: profile.goal, offerEvidence: points.map(point => point.title).join(' · '),
      reasonsTitle: profile.pointsTitle, points, processTitle: recharge ? '代充，具体怎么做？' : account ? '账号，具体怎么拿到？' : verification ? '接码，具体怎么办理？' : redemption ? '链接，具体怎么兑换？' : '具体怎么办理？', processSubtitle: profile.solution, steps: profile.steps, stepDetails: profile.stepDetails,
      ctaTitle: profile.ending, ctaButton: profile.button, ctaNote: profile.ctaNote, disclaimer}}, product, info);
}

module.exports = {createCopywriting};

