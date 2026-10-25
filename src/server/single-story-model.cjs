const STORY_FPS = 24;
const STORY_DURATION = 360;
const STORY_BOUNDARIES = [0, 72, 156, 228, 300, 360];

function text(value, limit, label) {
  const result = String(value ?? '').trim();
  if (Array.from(result).length > limit) throw new Error(label + '过长，请精简，不会自动截断');
  return result;
}

function normalizeStory(input = {}, defaults = {}) {
  const value = {...defaults, ...input};
  const points = value.points || [];
  const steps = value.steps || [];
  const stepDetails = value.stepDetails || steps.map(() => '具体操作以确认后的交付说明为准');
  if (!Array.isArray(stepDetails) || stepDetails.length !== 3) throw new Error('办理流程需要3条操作说明');
  if (!Array.isArray(points) || points.length !== 3 || !Array.isArray(steps) || steps.length !== 3) throw new Error('单品广告需要3项说明和3个步骤');
  const strength = Number(value.backgroundStrength ?? 0.18);
  if (!Number.isFinite(strength) || strength < 0 || strength > 0.5) throw new Error('背景强度应在0到0.5之间');
  return {
    scenarioAudience: text(value.scenarioAudience, 80, '适用用户'),
    scenarioBasis: text(value.scenarioBasis, 240, '卡点核对依据'),
    serviceBoundary: text(value.serviceBoundary, 100, '服务边界'),
    brand: text(value.brand || '杰哥AI订阅小铺', 24, '品牌名称'),
    category: text(value.category, 18, '商品分类'),
    productTitle: text(value.productTitle, 64, '视频商品名'),
    hookTitle: text(value.hookTitle, 24, '开场标题'),
    hookSubtitle: text(value.hookSubtitle, 48, '开场副标题'),
    hookQuestion: text(value.hookQuestion || '怎么办？', 18, '问题转折句'),
    hookAnswer: text(value.hookAnswer || '看看这款对应方案', 40, '痛点解决句'),
    hookPayoff: text(value.hookPayoff || '先问清，再决定', 48, '开场收束句'),
    offerSubtitle: text(value.offerSubtitle, 48, '商品承接句'),
    offerScene: text(value.offerScene || '本期单品方案', 40, '使用场景'),
    offerEvidence: text(value.offerEvidence || '具体权益以商品页面为准', 64, '商品要点'),
    reasonsTitle: text(value.reasonsTitle || '买之前，这三点别漏。', 24, '卖点页标题'),
    processTitle: text(value.processTitle || '这一步，怎么搞定？', 24, '流程页标题'),
    processSubtitle: text(value.processSubtitle || '先确认条件，再按说明办理', 48, '流程页副标题'),
    points: points.map(point => ({title: text(point?.title, 12, '说明标题'), detail: text(point?.detail, 48, '说明内容')})),
    steps: steps.map(step => text(step, 18, '办理步骤')),
    stepDetails: stepDetails.map(detail => text(detail, 48, '办理步骤说明')),
    ctaTitle: text(value.ctaTitle, 40, '结尾标题'),
    ctaButton: text(value.ctaButton, 24, '结尾按钮'),
    ctaNote: text(value.ctaNote || '带上你的使用需求，先问清再决定', 48, '结尾承接句'),
    disclaimer: text(value.disclaimer, 64, '补充说明'),
    accent: /^#[0-9a-f]{6}$/i.test(value.accent || '') ? value.accent : '#A65F49',
    backgroundStrength: strength,
    confirmed: value.confirmed === true
  };
}

function validateStory(story) {
  const value = normalizeStory(story);
  const errors = [];
  for (const key of ['productTitle', 'offerScene', 'hookTitle', 'hookSubtitle', 'hookQuestion', 'hookAnswer', 'offerSubtitle', 'hookPayoff', 'ctaTitle', 'ctaButton', 'disclaimer']) if (!value[key]) errors.push('请填写完整的单品广告内容：' + key);
  if (value.points.some(point => !point.title || !point.detail) || value.steps.some(step => !step) || value.stepDetails.some(detail => !detail)) errors.push('请填完整3项说明和3个步骤');
  if (!value.scenarioBasis) errors.push('请填写卡点核对依据，例如已核实的咨询场景或商品适用条件；不要填写客户隐私');
  if (!value.serviceBoundary) errors.push('请核对并填写这款商品能解决什么、不能解决什么');
  if (!value.confirmed) errors.push('请核对国内用户场景、真实卡点、服务边界及各幕文案，并勾选确认后再导出');
  return errors;
}

function stockStatus(stock) {
  const value = String(stock ?? '').trim();
  if (/缺货|售罄|无货/.test(value)) return 'out-of-stock';
  const number = value.match(/^\d+(?:\.\d+)?/);
  if (number) return Number(number[0]) > 0 ? 'available' : 'out-of-stock';
  return /充足|有货|现货/.test(value) ? 'available' : 'unknown';
}

function fitStoryText(value, width, maximum, minimum = 30, lines = 2) {
  const units = Array.from(String(value)).reduce((sum, char) => sum + (/[^\x00-\xff]/.test(char) ? 1 : /[MW@]/.test(char) ? 0.85 : 0.57), 0);
  return Math.max(minimum, Math.min(maximum, width * lines / Math.max(1, units)));
}

function getStoryNarrative(story) {
  const value = normalizeStory(story);
  return {goal: value.offerScene, blocker: value.hookSubtitle, question: value.hookQuestion, solution: value.hookAnswer, mechanism: value.offerSubtitle, details: value.points, steps: value.steps, stepDetails: value.stepDetails, result: value.hookPayoff, cta: {title: value.ctaTitle, button: value.ctaButton, note: value.ctaNote, brand: value.brand}};
}

module.exports = {getStoryNarrative, STORY_FPS, STORY_DURATION, STORY_BOUNDARIES, normalizeStory, validateStory, stockStatus, fitStoryText};

