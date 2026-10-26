export type SingleStory = {
  scenarioAudience: string; scenarioBasis: string; serviceBoundary: string;
  brand: string; category: string; productTitle: string; hookTitle: string; hookSubtitle: string;
  offerSubtitle: string; points: {title: string; detail: string}[]; steps: string[]; stepDetails: string[];
  hookQuestion: string; hookAnswer: string; hookPayoff: string; offerScene: string; offerEvidence: string;
  reasonsTitle: string; processTitle: string; processSubtitle: string; ctaNote: string;
  ctaTitle: string; ctaButton: string; disclaimer: string; accent: string;
  backgroundStrength: number; confirmed: boolean;
};
export type DecisionFlow = {
  version: number;
  emotion: {
    tension: {emotion: string; eyebrow: string; headline: string; subline: string};
    reveal: {emotion: string; eyebrow: string; headline: string; payoff: string};
    reassurance: {emotion: string; eyebrow: string; headline: string; subline: string};
    ease: {emotion: string; eyebrow: string; headline: string};
    action: {emotion: string; eyebrow: string; headline: string};
  };
  price: {question: string; referencePrice: string; label: string; answer: string; context: string; blocker: string};
  product: {question: string; title: string; category: string; answer: string; useCase: string; boundary: string; specs: string[]};
  trust: {question: string; framing: string; facts: SingleStory['points']; result: string};
  process: {question: string; subtitle: string; steps: {title: string; detail: string}[]};
  action: {question: string; title: string; button: string; note: string; disclaimer: string};
};
export const STORY_FPS: number;
export const STORY_DURATION: number;
export const STORY_BOUNDARIES: number[];
export function normalizeStory(input?: Partial<SingleStory>, defaults?: Partial<SingleStory>): SingleStory;
export function validateStory(story: SingleStory): string[];
export function stockStatus(stock: unknown): string;
export function fitStoryText(value: string, width: number, maximum: number, minimum?: number, lines?: number): number;
export function getStoryNarrative(story: SingleStory): {goal: string; blocker: string; question: string; solution: string; mechanism: string; details: SingleStory['points']; steps: string[]; stepDetails: string[]; result: string; cta: {title: string; button: string; note: string; brand: string}};
export function buildDecisionFlow(story: SingleStory, product?: {price?: string; facts?: readonly string[]}): DecisionFlow;
