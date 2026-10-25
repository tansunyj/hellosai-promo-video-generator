function identifyOffer(product, info) {
  const title = info.title;
  let brand = info.brand;
  const named = [[/github/i, 'GitHub'], [/kiro/i, 'Kiro'], [/figma/i, 'Figma'], [/icloud|隐私邮箱/i, 'iCloud'], [/outlook|hotmail/i, 'Outlook'], [/纸飞机|telegram/i, 'Telegram'], [/即梦/, '即梦'], [/\bINS\b/i, 'Instagram']];
  if (!brand) brand = named.find(([pattern]) => pattern.test(title))?.[1];
  if (product.category === 'KYC' && /成品号|kyc/i.test(title)) brand = 'Claude';
  if (!brand && /Plus|Pro\b|Pro\d/i.test(title) && !/Gemini|Cursor|Claude|Kiro/i.test(title)) brand = 'ChatGPT';
  if (/GFree|G free|OpenAI|GP\.T|G·PT|G·P·|G JPT/i.test(title) || /free|母号/i.test(title) && /已接|未接|G密码|GFree/i.test(title) && !/gro-free/i.test(title)) brand = /除Codex/i.test(title) ? 'ChatGPT' : /codex/i.test(title) ? 'Codex' : 'ChatGPT';
  let type = 'needs-review';
  if (/TeamLink|48Team长链接提取/i.test(title)) type = /优惠码/.test(title) && !/长链接提取/.test(title) ? 'coupon' : 'link-tool';
  else if (/租用|使用权/.test(title)) type = 'rental';
  else if (/隐私邮箱|取码url/i.test(title)) type = 'privacy-mail';
  else if (/邀请.*(?:奖励|额度)|好友邀请/.test(title)) type = 'invitation-reward';
  else if (/codex.*(?:\d+点|\d+额度)/i.test(title)) type = /非API|使用额度|直充自己号/.test(title) ? 'usage-credit' : 'credit-review';
  else if (/只是资格|半价资格/.test(title)) type = 'eligibility';
  else if (/成品号|成品账号|成品会员号|共享号|账密|账号|G密码|GFree|G free|free.*(?:已接|未接)|已接.*free|母号未分裂/i.test(title) && !/领取|直充|直冲|代充|充值|代付|续费\/新开/.test(title)) {
    type = /共享号/.test(title) ? 'shared-account' : /教育|学生/.test(title) ? 'education-account' : /Plus|Pro|Max|Ultra|Super/i.test(title) && !/free|白号|无订阅/i.test(title) ? 'paid-account' : 'account';
  }
  else if (/兑换链接|礼品链接|激活链接/.test(title)) type = 'redemption';
  else if (/接马|接码|自动接\s*\||长效接|短效接/.test(title)) type = 'verification';
  else if (/kyc|认证/i.test(title)) type = 'eligibility';
  else if (/只保激活|领取/.test(title)) type = 'activation';
  else if (/官充|直充|直冲|充值|代充|代付|CDK.*可充|CDK.*充值/i.test(title)) type = 'recharge';
  else if (/邀请码/.test(title)) type = 'invite-code';
  else if (/白号|个人邮箱|谷歌后缀|企业邮箱|Graph|OAuth|INS.*老号/i.test(title)) type = 'account';
  else if (/Business|team/i.test(title)) type = 'team-seat';
  const issues = [];
  if (/活动已结束|请勿下单|已下架/.test(title)) issues.push('原商品已注明停止销售，禁止直接投放');
  if (/\d{1,2}\.\d{1,2}号.*踢/.test(title)) issues.push('包含固定退组日期，必须核对当前有效期');
  if (['needs-review', 'credit-review'].includes(type)) issues.push(type === 'credit-review' ? '额度单位、用途、到账方式未明确，不能当API余额或会员销售' : '交付形式未明确，需补充是代充、账号、链接还是其他服务');
  if (/无订阅|free|白号/i.test(title) && ['account', 'education-account'].includes(type)) issues.push('普通账号不代表已含付费会员');
  if (type === 'eligibility' || type === 'education-account') issues.push('需核实真实资格和平台规则，不承诺绕过身份审核');
  if (/无客服/.test(title)) issues.push('原商品注明无客服支持，需要自行按说明操作');
  if (brand === 'Claude') issues.push('商家确认Claude不参与质保；不能沿用原名旧质保承诺');
  if (/无质保|无售后|只保激活|首登|保订阅不包封号|售后.{0,6}1个?小时|1小时(?:内使用|后过期)/.test(title)) issues.push('保障范围或链接时限受限，必须在视频中保留对应说明');
  if (type === 'team-seat' && /48个月/.test(title)) issues.push('原名48个月与质保一个月不是同一承诺，期限必须向商家核实');
  const kind = {recharge:'充值方案', account:'账号方案', 'paid-account':'账号方案', 'education-account':'账号方案', 'shared-account':'账号方案', verification:'验证服务', redemption:'兑换方案', activation:'权益方案', rental:'租用方案', 'team-seat':'团队席位', 'usage-credit':'额度补充', 'credit-review':'额度待核对', 'privacy-mail':'收件服务', 'invitation-reward':'邀请奖励', 'invite-code':'邀请码', eligibility:'资格服务', 'link-tool':'链接工具', coupon:'优惠码'}[type] || '待核对方案';
  const tier = title.match(/Max\s*20x|Max\s*5x|Pro\s*(?:500|200|100|25x|20x|5x)|\bGo\b/i)?.[0] || info.tier;
  let shortTitle = [brand || product.category || '商品', tier, kind].filter(Boolean).join(' · ');
  if (type === 'usage-credit' || type === 'credit-review') shortTitle = 'Codex · ' + (title.match(/\d+(?=点|额度)/)?.[0] || '') + (type === 'usage-credit' ? '点使用额度' : '额度方案');
  if (/TeamLink/i.test(title)) shortTitle = 'TeamLink · ' + (title.match(/\d+次卡/)?.[0] || '优惠码');
  if (brand === 'Grok' && type === 'paid-account') shortTitle = 'Grok · 成品会员号';
  if (brand === 'Outlook') shortTitle = (/hotmail/i.test(title) ? 'Hotmail' : 'Outlook') + ' · ' + (/Graph/i.test(title) ? 'Graph' : 'OAuth2') + '邮箱';
  return {type, brand, kind, tier, shortTitle, issues, blocked: issues.some(issue => /禁止直接投放|必须核对当前|未明确|期限必须|需核实真实资格/.test(issue))};
}

module.exports = {identifyOffer};

