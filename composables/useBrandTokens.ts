/**
 * The ONLY place a locked brand colour is mirrored outside design-tokens.css.
 *
 * `<meta name="theme-color">` is consumed by the browser chrome before any
 * stylesheet is parsed, so it cannot reference a CSS custom property — it has
 * to be a literal. Rather than scatter literals through head config, both
 * values live here, named, with their parent token.
 *
 * If a locked colour ever changes in design-tokens.css, this file must change
 * with it. Nothing else in the app is allowed to hardcode a brand colour.
 */
export const BRAND = {
  /** = --brand-paper / --paper-50 — the light-mode page surface */
  paper: '#faf6ef',
  /** = --brand-ink / --ink-950 — the dark-mode page surface */
  ink: '#0d1b17',
} as const
