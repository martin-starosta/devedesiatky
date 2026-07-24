const CONTENT_BAND = 96

/** Banner height under status bar (B′): inset + content band. */
export function bannerHeight(topInset: number): number {
  return topInset + CONTENT_BAND
}
