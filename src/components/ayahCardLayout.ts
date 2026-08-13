export interface AyahCardLayoutInput {
  text: string;
  measuredLines: number;
  lineHeight: number;
  hasAction: boolean;
  maxLines?: number;
}

export function estimateAyahLines(text: string): number {
  const wordCount = text.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(2, Math.ceil(wordCount / 5));
}

export function ayahCardHeight({ text, measuredLines, lineHeight, hasAction, maxLines }: AyahCardLayoutInput): number {
  const rawLines = measuredLines > 0 ? measuredLines : estimateAyahLines(text);
  const lines = maxLines ? Math.min(rawLines, maxLines) : rawLines;
  return Math.max(320, 148 + lines * lineHeight + (hasAction ? 64 : 0));
}
