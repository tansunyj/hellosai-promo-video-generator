const {brandScenario} = require('./single-brand-scenarios.cjs');

function localizeScenario(product, info, profile) {
  const name = info.brand || product.category || '这个工具';
  const target = name + (info.tier ? ' ' + info.tier : '');
  const uses = {ChatGPT: '写作、整理资料', Claude: '长文处理、整理资料', Codex: '编程辅助', Grok: '日常问答', Gemini: '学习、办公', Google: '邮箱及相关工具', Cursor: '编程辅助', 多邻国: '外语学习', Steam: '游戏娱乐'};
  const use = uses[info.brand] || '自己的日常任务';
  const audience = '有' + use + '需求、需要核对开通条件的国内用户';
  const boundary = {
    recharge: '仅对接约定的充值；账号适用条件、渠道和售后须先核对',
    verification: '仅限约定项目的收码环节，不代替实名、刷脸或身份审核',
    account: '按约定规格交付账号；普通账号不包含付费会员',
    'paid-account': '所含订阅须逐项核对，不保证免审核或长期不封号',
    redemption: '仅交付约定链接；地区、资格及兑换条件须先核对',
    eligibility: '仅按真实资格办理，不代替审核或保证认证成功',
    'team-seat': '团队席位不等于个人独立订阅，权限和期限须核对'
  }[profile.key] || '原数据未明确的服务能力，须由商家确认后才能宣传';
  const contextual = {
    recharge: {
      goal: '想开通' + target + '辅助日常任务',
      question: '想开通' + name + '，充值这步卡住？',
      alternatives: [name + '账号有了，会员怎么充？', '想续订' + name + '，这款能充吗？'],
      problem: '想用于' + use + '，却卡在订阅办理？',
      solution: '这款充值服务，先确认能否承接',
      mechanism: '核对套餐与账号适用条件，再对接约定的充值',
      result: '完成后在账号内核对套餐和有效期'
    },
    verification: {
      goal: '想注册' + name + '用于' + use,
      question: name + '注册，卡在收验证码？',
      problem: '如果正卡在收码这一步，先确认支持项目',
      solution: '对接这款验证服务，先核对收码范围',
      mechanism: '仅按约定项目收码，不代办身份审核'
    },
    account: {
      goal: '想准备' + name + '账号用于' + use,
      question: '想用' + name + '，账号还没准备好？',
      alternatives: ['想用' + name + '，这款账号适合吗？', name + '账号交付后，先核对什么？'],
      problem: '需要可用账号，但类型和交付条件还没确认？'
    },
    'paid-account': {
      goal: '想用' + target + '处理日常任务',
      question: name + '成品号，到手先核对什么？',
      alternatives: ['想用' + name + '，成品号包含什么？', name + '账号与会员，是一回事吗？'],
      problem: '想用于' + use + '，账号包含哪些订阅还没弄清？'
    },
    redemption: {
      goal: '想兑换' + target + '的对应权益',
      question: name + '兑换链接，自己的号能用吗？',
      problem: '想用于' + use + '，但兑换条件还没对上？'
    }
  }[profile.key] || {};
  const localized = brandScenario(product, info, {...profile, ...contextual});
  return {...localized, audience, boundary: localized.merchantRule?.warranty === 'none' ? localized.merchantRule.risk : boundary, evidence: {
    productFacts: [{field: '商品原名', value: info.title}, ...(info.duration ? [{field: '套餐周期', value: info.duration}] : [])],
    useCase: use, scenario: localized.scenario, merchantRule: localized.merchantRule, blockerStatus: localized.merchantRule ? 'merchant-reported-needs-final-review' : 'merchant-review-required',
    note: localized.merchantRule ? '卡点依据为商家2026-10-24反馈，不等于已核实的全站注册政策或官方价格比较' : '使用场景为候选切入，不代表所有国内用户都遇到；需核对真实咨询及商品承接能力'
  }};
}

module.exports = {localizeScenario};

