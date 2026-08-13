export interface AyahCardLayoutInput {
  text: string;
  measuredLines: number;
  lineHeight: number;
  hasAction: boolean;
}

export function estimateAyahLines(text: string): number {
  const wordCount = text.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(2, Math.ceil(wordCount / 5));
}

export function ayahCardHeight({ text, measuredLines, lineHeight, hasAction }: AyahCardLayoutInput): number {
  const lines = measuredLines > 0 ? measuredLines : estimateAyahLines(text);
  return Math.max(320, 148 + lines * lineHeight + (hasAction ? 64 : 0));
}
