module.exports = {
  version: 1, updatedAt: '2026-10-24', source: '商家本次会话明确补充的服务口径与客户卡点',
  brands: {
    Claude: {warranty: 'none', blocker: '注册或账号准备受阻；充值只承接已有账号', registrationClosed: {merchantReported: true, officialVerified: false}, risk: '不提供质保，不承诺避免封号或恢复账号'},
    Google: {blocker: '部分国内用户注册Gmail或完成注册验证不顺利'},
    Muse: {blocker: '自行注册步骤繁琐，成品号减少自行注册准备'},
    Grok: {blocker: '账号注册后订阅支付办理麻烦；普通号不等于含套餐成品号'},
    多邻国: {blocker: '希望降低会员开支，关注低预算权益方案', officialComparison: null},
    Gemini: {blocker: '希望降低订阅开支，关注低预算套餐及兑换条件', officialComparison: null},
    ChatGPT: {blocker: '已有账号但订阅支付或充值办理受阻'}
  },
  comparisonRule: '无同地区、同周期、同权益且已核实的官方基准，不生成比官方省X元承诺',
  registrationRule: '未核实全站政策，不把注册受限写成全球关闭注册'
};
