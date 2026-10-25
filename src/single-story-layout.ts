import {STORY_BOUNDARIES} from './server/single-story-model.cjs';

export const STORY_CONTENT_WIDTH = 852;

export function storyScene(frame: number) {
  const last = STORY_BOUNDARIES.length - 2;
  const found = STORY_BOUNDARIES.findIndex((start, index) => frame >= start && frame < STORY_BOUNDARIES[index + 1]);
  const phase = found < 0 ? frame < 0 ? 0 : last : found;
  const local = Math.max(0, frame - STORY_BOUNDARIES[phase]);
  const duration = STORY_BOUNDARIES[phase + 1] - STORY_BOUNDARIES[phase];
  return {phase, local, duration, active: Math.min(2, Math.floor(local * 3 / duration))};
}

export function displayProductTitle(title: string) {
  const name = title.replace(/\s*·\s*(充值方案|账号方案|团队席位|商品方案|待核对方案|兑换方案|权益方案|验证服务)$/, '').replace(/\s*·\s*/g, ' ');
  return name || title;
}

export function storyJourney(category: string): [string, string, string] {
  const journeys: Record<string, [string, string, string]> = {
    '充值方案': ['已有账号', '订阅付款', '对应套餐'],
    '账号方案': ['想开始用', '账号准备', '现成账号'],
    '验证服务': ['继续注册', '接收验证码', '对应接码'],
    '兑换方案': ['想用权益', '兑换入口', '链接兑换'],
    '权益方案': ['想用权益', '领取入口', '对应领取'],
    '额度补充': ['任务继续', '使用额度', '点数补充'],
    '额度待核对': ['继续任务', '额度类型', '核对方案'],
    '收件服务': ['接收邮件', '取信入口', '收件方案'],
    '租用方案': ['短期需求', '使用期限', '限期租用'],
    '团队席位': ['团队需求', '加入方式', '席位方案'],
    '邀请码': ['参与活动', '邀请入口', '按规则参与'],
    '邀请奖励': ['了解奖励', '领取资格', '活动入口'],
    '资格服务': ['真实需求', '适用资格', '合规办理'],
    '链接工具': ['提取链接', '工具次数', '对应卡密'],
    '优惠码': ['选对应套餐', '适用范围', '优惠码']
  };
  return journeys[category] || ['选择规格', '服务范围', '对应方案'];
}

