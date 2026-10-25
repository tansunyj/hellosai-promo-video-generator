module.exports = {
  checkedAt: null, lastVerificationAttempt: '2026-10-24', verificationStatus: 'unavailable', maxAgeDays: 30,
  references: {
    geminiPro: {name: 'Google AI Pro', currency: 'USD', amount: 19.99, period: 'month', region: '美国', quote: 'Google AI Pro：US$19.99/月（美国标准价）', source: 'https://one.google.com/about/google-ai-plans/'},
    superGrok: {name: 'SuperGrok', currency: 'USD', amount: 30, period: 'month', region: '官网美元定价', quote: 'SuperGrok：US$30/月（官网标准价）', source: 'https://x.ai/news/grok-4'},
    superGrokHeavy: {name: 'SuperGrok Heavy', currency: 'USD', amount: 300, period: 'month', region: '官网美元定价', quote: 'SuperGrok Heavy：US$300/月（官网标准价）', source: 'https://x.ai/news/grok-4'},
    duolingoSuper: {name: 'Super Duolingo', currency: 'USD', amount: 83.99, period: 'year', region: '美国App Store列示项目', quote: 'Super Duolingo：US$83.99/年（美区列示价）', source: 'https://apps.apple.com/us/app/duolingo-language-lessons/id570060128'}
  },
  publicationRule: '以上为待复核候选值；未逐项标记verified及verifiedAt时，不注入视频，不视作已核实事实',
  scopeNote: '官方常规价仅作预算参考；地区、计费周期、权益及交付条件可能不同，不据此计算同款折扣'
};
