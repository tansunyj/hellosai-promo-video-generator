function merchandiseCopy(copy, product, info) {
  const title = info.title;
  const type = info.type;
  const name = info.brand === 'Google' ? 'Gmail' : info.brand || product.category || '这款服务';
  const price = String(product.price || '').match(/[¥￥]\s*\d+(?:\.\d+)?/)?.[0]?.replace(/\s/g, '') || '页面报价';
  const target = name + (info.tier ? ' ' + info.tier : '');
  const story = {...copy.story, points: copy.story.points.map(point => ({...point}))};
  const point = (heading, detail) => ({title: heading, detail});
  const patch = (hook, problem, answer, goal, mechanism, reasons, steps, details, ending, button) => Object.assign(story, {
    hookTitle: hook, hookSubtitle: problem, hookQuestion: '怎么办？', hookAnswer: answer,
    offerScene: goal, offerSubtitle: mechanism, reasonsTitle: '下单前，三件事先看清', points: reasons,
    processTitle: '怎么买？三步看懂', processSubtitle: answer, steps, stepDetails: details,
    hookPayoff: details[2], ctaTitle: ending, ctaButton: button, ctaNote: '带上用途和账号情况，先核对再下单'
  });
  const applications = {ChatGPT:'写作、整理资料', Codex:'编程任务', Claude:'长文写作、代码分析', Grok:'问答与资料整理', Gemini:'学习与资料处理', Cursor:'代码编辑', Muse:'AI任务', Gmail:'收邮件、管理账号', GitHub:'托管代码、协作开发', Steam:'管理游戏账号', Instagram:'整理账号使用需求', Figma:'设计与协作', Kiro:'开发任务', '即梦':'图像与视频创作'};
  let angle = copy.evidence?.sellingAngle || 'service-specific';
  if (type === 'recharge') {
    angle = 'payment-friction';
    const invoice = /国内发票|报销|可开发票|可开票/.test(title);
    const ownAccount = /自己|个人账号|直充/.test(title);
    const tierHook = info.tier ? target + '支付卡住？' : name + '账号有了，会员怎么充？';
    patch(tierHook, '账号已经有了，偏偏卡在订阅支付这一步？', ownAccount ? '用自己的账号，按对应档位办理' : '先核对适用账号，再选对应订阅方案', '已有账号，想开通' + (info.tier || '对应套餐'), '页面参考价' + price + ' · ' + (info.duration || '周期需核对') + ' · 不含账号注册', [
      point(ownAccount ? '自己的账号办理' : '适用账号先核对', '不是另外买账号；地区、档位和办理渠道需匹配'),
      point(invoice ? '有开票需求可问' : info.tier ? '对应' + info.tier + '档' : '按所选套餐办理', invoice ? '原商品标注可开票，开票主体、类型及费用先确认' : '本报价对应当前规格，不将不同档位混为一谈'),
      point('完成后自己验收', '登录账号查看实际套餐和有效期，不以口头承诺代替')
    ], ['确认账号与档位', '按说明办理订阅', '查看套餐与有效期'], ['提供目标档位和账号地区，不提供无关身份资料', '核对适用条件后，通过约定的安全方式办理', '登录自己的账号，核对套餐及到期时间'], '订阅这一步，选对方案再办理。', '看主页简介 · 核对订阅方案');
    story.reasonsTitle = '省不省，先看清这3点';
    story.processTitle = '怎么买？3步看懂';
    story.ctaNote = '带上账号地区与目标档位，先确认适用条件';
    if (invoice) {story.hookTitle = name + '充值想开票？看看这一款'; story.reasonsTitle = '充值和开票需求，一起说清楚';}
    if (/全自动|自动卡密|自动发货/.test(title) && !invoice) story.points[1] = point('标注自助办理', '原名含自动办理或卡密发货，实际流程按说明操作');
    if (name === 'Grok') {story.hookTitle = 'Grok' + (info.duration || '套餐') + '只要' + price + '？'; story.hookSubtitle = '想控制订阅预算，又卡在支付这一步？'; angle = 'price-and-payment';}
  } else if (['account', 'paid-account', 'education-account', 'shared-account'].includes(type)) {
    angle = type === 'paid-account' ? 'ready-membership' : 'ready-account';
    const paid = type === 'paid-account';
    const free = /free|白号|无订阅/i.test(title);
    const partial = /未接|未过手机/.test(title);
    const email = ['Gmail', 'Outlook', 'iCloud'].includes(name) || /企业邮箱/.test(title);
    const hook = name === 'Gmail' ? 'Gmail注册卡住？现成邮箱怎么选？' : name === 'Outlook' ? '要接入邮件工具？邮箱授权别选错' : name === 'Muse' ? 'Muse注册太麻烦？试试现成号' : paid ? name + '注册还要订阅？看看成品号' : name + '想开始用，账号还没准备好？';
    patch(hook, paid ? '不想从注册到订阅支付，自己折腾一遍？' : partial ? '账号可以先准备，手机验证仍需另行处理' : '想用来' + (applications[name] || (email ? '收发邮件' : '处理日常任务')) + '，不想反复准备注册？', paid ? '选择含对应套餐的成品账号' : email ? '选择符合用途的现成邮箱' : '现成账号交付，减少注册准备', '把时间用在需求上，而不是账号准备上', price + '对应本款' + (paid ? '含套餐账号' : '账号') + '，' + (info.duration ? '标注' + info.duration : '按所列资料交付'), [
      point(paid ? '账号和套餐一起看' : '少走注册准备', paid ? '交付后核对实际套餐，不额外承诺包含其他档位' : '提供约定的现成账号，不保证免后续平台验证'),
      point(partial ? '手机验证未完成' : /2fa/i.test(title) ? '标注2FA资料' : '按约定资料交付', partial ? '原商品注明未接码或未验证，不宣传为验证已完成' : /2fa/i.test(title) ? '交付含原名标注的2FA资料，妥善保管恢复信息' : '按交付说明登录，并确认资料和使用范围'),
      point(free ? '普通号不是会员' : '到手先验收', free ? '不把Free、白号或无订阅账号说成付费套餐' : '查看登录状态、账号归属及实际包含的权益')
    ], ['选择账号规格', '下单领取交付资料', '按说明登录验收'], ['分清普通号、含套餐账号、地区和使用限制', '按所选规格接收账号资料，不公开密码或令牌', '登录后核对资料和权益，必要验证按平台规则完成'], '不想反复准备账号？按用途选对这一款。', '看主页简介 · 选账号方案');
    if (name === 'Outlook') story.points[1] = point(/Graph/i.test(title) ? 'Graph授权形式' : 'OAuth2授权形式', /IMAP|POP3/.test(title) ? '原名标注IMAP、POP3；接入前匹配所用客户端' : '授权格式需与邮件工具匹配，不把令牌当通用密码');
    if (/恢复码/.test(title)) story.points[1] = point('含恢复资料说明', '原名标注2FA与恢复码；妥善保管并按说明检查换绑');
    if (/带RT|有sso|rt格式/i.test(title)) story.points[1] = point('授权格式要匹配', '按原名RT或SSO格式交付，先匹配所用工具，不公开令牌');
    if (/不包GCP/.test(title)) story.points[1] = point('不包含GCP保障', '原名明确不包GCP，不把邮箱交付当云平台权限开通');
    if (/除Codex/.test(title)) story.points[1] = point('不适用于Codex', '原名明确排除Codex用途，不能为该用途购买');
    if (name === 'Steam') {story.hookTitle = '要准备Steam账号？先分清地区'; story.points[1] = point('地区明确再选择', '本款标注' + (title.match(/美国|香港|日本/)?.[0] || '对应地区') + '，不承诺因此可跨区购买');}
    if (type === 'shared-account') {angle = 'shared-access'; story.hookTitle = name + '想体验？先了解共享号'; story.hookSubtitle = '只想先体验，但不清楚共享与独享的区别？'; story.hookAnswer = '这款交付共享号，不是独享订阅'; story.points[0] = point('共享使用形式', '多人使用与独享不同，账号权限、并发和隐私须确认'); story.serviceBoundary = '仅共享使用范围，不承诺独占账号或长期会员';}
    if (type === 'education-account') {angle = 'education-account'; story.hookTitle = name + '教育账号，和普通号有何不同？'; story.hookSubtitle = '想用教育方案，资格和权益不能混着看'; story.hookAnswer = '先核实资格，再看这款教育账号'; story.points[1] = point('真实资格要求', '必须核实实际适用资格，不冒用身份或承诺免审核');}
  } else if (type === 'verification') {
    angle = 'verification-step';
    const span = title.match(/\d+-\d+天|\d+-\d+[^天]{0,2}天|\d+天/)?.[0];
    const long = /长效/.test(title) || !!span;
    patch(name + '卡在收验证码？先看这一步', '账号或注册流程走到手机验证，号码这关卡住？', '对应项目接码服务，只处理收码环节', '解决指定项目的验证码接收需求', price + '是本款接码报价，不是账号或会员价格', [point('只解决收码这步', '先确认项目和用途支持，不代办人脸或身份认证'), point(long ? '有效期要匹配' : '单次用途要对上', span ? '原商品标注' + span + '，次数和起算点需确认' : '按本商品次数与有效期办理，不默认长期使用'), point(/换号/.test(title) ? '有换号说明' : '收码后继续办理', /换号/.test(title) ? '原名提到换号功能，操作与限制按交付说明' : '验证码按指定流程使用，不保证平台审核通过')], ['确认项目与用途', '取得号码并收码', '完成对应验证步骤'], ['说明服务名称、注册或绑定用途及所需有效期', '按服务说明操作，不把验证码公开给无关人员', '按平台规则完成收码步骤，其他审核不在服务范围'], '卡在哪一步，就选解决那一步的服务。', '看主页简介 · 查看接码方案');
  } else if (type === 'usage-credit' || type === 'credit-review') {
    angle = 'usage-top-up';
    const quantity = title.match(/\d+(?=点|额度)/)?.[0];
    patch('Codex任务还没写完，额度先用完？', '想继续处理编程任务，需要补充对应额度？', type === 'usage-credit' ? '选择Codex使用点数补充方案' : '有额度补充方案，先确认单位与用途', '任务继续做，按需要补对应额度', quantity + (type === 'usage-credit' ? '点使用额度，参考价' : '额度规格待确认，参考价') + price, [point(type === 'usage-credit' ? quantity + '点使用额度' : '额度类型待确认', type === 'usage-credit' ? '原名明确非API额度，不说成API调用余额' : '原名仅写额度数量，单位和权益范围不能猜'), point('与会员分开看', '额度补充不自动等于升级会员或延长订阅'), point('按到账记录验收', '明确交付方式后核对余额变化和使用限制')], ['匹配额度用途', '按交付方式办理', '核对点数与限制'], ['分清Codex使用点数、会员档位与API余额', '先明确单位、账号要求和到账方式再下单', '核对实际增加的额度，不将商品数字当通用余额'], '任务需要继续，先补对额度类型。', '看主页简介 · 查看额度方案');
  } else if (type === 'invitation-reward' || type === 'invite-code') {
    angle = 'invitation-entry';
    patch(type === 'invite-code' ? name + '要邀请码？入口在这一步' : 'Codex想领邀请奖励，入口在哪？', type === 'invite-code' ? '想参与对应活动，却还没准备好邀请码？' : '想用邀请活动补额度，却没弄清资格与领取方式？', type === 'invite-code' ? '获取邀请码，再按活动规则操作' : '卡密自助邀请，按活动规则领取', '走清楚邀请入口，不把活动奖励当无限额度', price + '对应邀请类商品，奖励以活动实际发放为准', [point('交付的是邀请入口', '邀请码或邀请服务不等于完整账号与会员订阅'), point('奖励有适用条件', '活动状态、领取资格和额度需核对，不保证人人可领'), point('实际领取再验收', '核对活动记录，不把标题中的奖励当到账承诺')], ['核对活动状态', '获取邀请入口', '按规则领取核验'], ['先确认活动仍开放且自己符合真实资格', '按商品说明取得邀请码或使用邀请卡密', '完成规定步骤，查看实际奖励及有效期'], '想补额度，先把邀请活动规则看明白。', '看主页简介 · 查看邀请方案');
  } else if (type === 'privacy-mail') {
    angle = 'mail-receiving';
    patch('只是收验证邮件，需要完整账号吗？', '想收邮件，却不想把完整邮箱账号都准备一遍？', '看看邮箱地址与取信入口交付方案', '解决邮件接收需求，不把收件入口当完整邮箱', price + '对应隐私邮箱收件服务，功能按商品范围', [point('面向接收邮件', '原商品标注隐私邮箱，不默认包含完整账号管理'), point('取信入口要保管', /取码url/i.test(title) ? '原名为邮箱加取码URL，按说明打开取信入口' : '先核对取信方式、支持用途与保存时间'), point('使用范围要对上', '不默认可登录iCloud后台、发信或永久保留邮件')], ['确认收件用途', '领取邮箱与入口', '按说明取信核验'], ['确认网站支持该邮箱形式和所需收件时间', '妥善保管地址与取信入口，不公开链接', '测试实际收件，仅按约定功能验收'], '只需要收件？别把商品类型买复杂。', '看主页简介 · 查看收件方案');
  } else if (type === 'rental') {
    angle = 'short-term-access';
    patch('邮箱只用几天，有必要买断吗？', '短期有邮箱使用需求，不想把租用误当永久账号？', '这款是7天使用权，不是账号买断', '按实际使用天数选择租用方案', price + '对应原名标注7天使用权，不自动获得其他资格', [point('7天使用权', '按租用期限使用，到期续用和资料处理先确认'), point('不等于永久持有', '交付的是约定使用权，不默认转移账号所有权'), point('域名不等于资格', '原名含教育邮箱描述，不自动证明学生身份')], ['确认用途与期限', '按说明领取使用权', '到期前处理个人资料'], ['确认所需用途在租用范围及起算时间', '按约定方式使用，不将租用当买断账号', '按租用协议处理到期访问和个人数据'], '短期需求，按期限准备，不买错形式。', '看主页简介 · 查看租用方案');
  } else if (type === 'team-seat') {
    angle = 'team-membership';
    patch('想用团队版，必须自己建团队吗？', '有团队版使用需求，却还没有安排好加入方式？', '了解团队席位方案，不混同个人订阅', '按实际需求选择团队席位', price + '对应席位类商品，使用期与权限单独核实', [point('交付团队席位', '不是个人独立会员，管理权限及可见范围可能不同'), point('加入方式先对上', '核对接收邀请账号、组织归属与使用范围'), point('使用期不等于质保', '原名期限与保障期限分开确认，不宣传永久稳定')], ['确认席位规格', '按说明接收邀请', '查看组织及使用期限'], ['确认实际可用周期、账号要求与数据权限', '通过约定入口加入，不将账号资料公开', '在账号内核对组织、权限和到期说明'], '团队版怎么加入？先选对席位形式。', '看主页简介 · 查看席位方案');
  } else if (type === 'link-tool' || type === 'coupon') {
    angle = type === 'coupon' ? 'coupon-scope' : 'link-workflow';
    patch(type === 'coupon' ? '优惠码便宜，不代表买到会员' : 'TeamLink提取链接，卡密怎么选？', type === 'coupon' ? '看到套餐名和优惠价格，容易把折扣码当会员？' : '需要提取长链接，但没弄清卡密次数与用途？', type === 'coupon' ? '交付优惠码，套餐费用另行区分' : '按使用次数选择链接工具卡密', type === 'coupon' ? '先选可用优惠，不把码当完整席位' : '按需求购买链接提取次数', price + '对应' + (type === 'coupon' ? '优惠码商品' : title.match(/\d+次卡/)?.[0] || '工具卡密') + '，不含完整订阅', [point(type === 'coupon' ? '是优惠码不是会员' : '是工具卡不是席位', '兑换范围和实际抵扣或工具能力需要先匹配'), point('用量与地区明确', type === 'coupon' ? '原名限定埃及或瑞典场景，不能当任意地区通用码' : '按标注次数操作，不承诺无限提取'), point('额外费用分开看', '会员订阅费用不能与工具或优惠码价格混算')], ['匹配适用范围', '领取卡密或优惠码', '操作后核对结果'], ['确认工具用途或优惠适用地区与账号', '按本商品说明领取并保管卡密', '检查工具结果或实际抵扣，其他订阅另行办理'], '买的是哪种码？先把用途分清。', '看主页简介 · 查看工具说明');
  } else if (type === 'eligibility') {
    angle = 'qualified-access';
    const kyc = /kyc/i.test(title);
    patch(kyc ? 'Claude遇到身份核验，怎么办？' : name + '优惠方案，资格符合吗？', kyc ? '平台要求身份核验，不清楚流程和支持范围？' : '想用对应优惠或教育权益，先分清资格和会员', kyc ? '仅了解合规核验协助与办理范围' : '按真实资格办理对应权益', kyc ? '了解真实身份核验流程及风险' : '符合条件再用资格类方案', price + '对应本商品服务，不是付费会员通用价', [point(kyc ? '不代造身份材料' : '资格不是完整会员', kyc ? '只能用真实资料按平台规则核验，不承诺通过' : '按商品标注的资格范围使用，不当普通会员销售'), point('先看实际支持范围', '账号要求、地区、操作方式及限制需确认'), point('不承诺免审核', '不宣传绕过刷脸、免封号或保证成功')], ['核对真实资格', '了解合规办理范围', '按平台规则核验'], ['如实说明账号状态，不提供无关敏感信息', '确认服务不含伪造资料或绕过身份认证', '通过平台允许的方式操作，实际审核由平台决定'], '涉及资格和身份，先核实，再决定。', '看主页简介 · 查看服务边界');
  } else if (['redemption', 'activation'].includes(type)) {
    angle = 'price-first';
    story.hookTitle = name + '套餐只要' + price + '？';
    story.hookSubtitle = '想控制订阅预算？看看这款低门槛方案';
    story.hookAnswer = type === 'redemption' ? '按适用条件兑换本款权益' : '按说明领取本款会员权益';
    story.offerScene = '想用' + name + '权益，先看本款参考预算';
    story.offerSubtitle = price + '对应本款' + (info.duration ? info.duration : '') + (type === 'redemption' ? '兑换方案' : '权益领取方案');
    story.points[0] = point('先看本商品报价', price + '是本商品参考价，不等同官方同规格套餐');
    story.points[1] = point(info.duration ? '标注' + info.duration : '领取本款权益', info.duration ? '原商品标注' + info.duration + '；实际适用账号和生效期需匹配' : '按商品流程领取，不把激活当作长期使用保证');
    if (/无需绑卡|不需要绑卡/.test(title)) story.points[1] = point('原名标注无需绑卡', '本款按链接流程办理，账号与地区仍须符合兑换条件');
    if (!/无质保|不质保|无售后|首登|只保激活|售后/.test(title)) story.points[2] = point('兑换后查看权益', '核对套餐、存储或会员标识，不将所有链接视为同一规格');
    story.reasonsTitle = '价格很低，权益也要看明白';
    story.ctaTitle = '想少花预算？按适用条件选这一款。';
    story.ctaButton = '看主页简介 · 查看省钱方案';
    story.steps = ['匹配账号与兑换条件', type === 'redemption' ? '领取链接按说明兑换' : '按说明领取激活权益', '查看生效权益和期限'];
    story.stepDetails = ['确认账号地区及本款资格，不默认人人都能使用', type === 'redemption' ? '收到对应链接后按说明兑换，注意商品使用时限' : '在适用账号按交付说明领取权益', '查看实际套餐与期限，激活保障和长期使用分开看'];
    story.hookPayoff = '小预算也要买对权益，兑换后看实际生效结果';
  } else {
    angle = 'information-required';
    story.hookTitle = name + '这款方案，先分清怎么交付';
    story.hookSubtitle = '名称有套餐信息，但还缺明确的办理方式';
    story.hookAnswer = '先补齐交付信息，不把不同服务混卖';
    story.offerSubtitle = price + '是原清单报价，交付方式尚待商家确认';
    story.points = [point('交付类型待补充', '需要明确充值、成品号、兑换链接或其他服务'), point('权益期限待核实', '只展示原名已写明的内容，不猜测使用权限'), point('补齐信息再推广', '这是审核草稿，不是可直接投放的完整承诺')];
    story.ctaTitle = '把交付方式说清，再决定是否适合。';
    story.ctaButton = '查看详情 · 先确认服务';
  }
  return {...copy, profile:type, story, hookOptions:[story.hookTitle, target + '怎么选？先看这款能解决什么'], evidence:{...copy.evidence, sellingAngle:angle, offerType:type, sourceTitle:title, publication:{status:info.blocked ? 'needs-information' : 'merchant-review', issues:info.issues}}};
}

module.exports = {merchandiseCopy};

