/** Fixed palette slots from section 8. Team colours come from the roster pack. */
export const OFF_WHITE = '#F5EFE6';
export const CHARCOAL = '#24232B';
export const CAR_BACKGROUND = '#F3EEE0';
export type ArtColors = {primary: string; secondary: string; accent: string};

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
const hex = (c: number[]) => '#' + c.map(v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
type Hsl = [number, number, number];
function toHsl([r, g, b]: [number, number, number]): Hsl {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
function fromHsl([h, s, l]: Hsl) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m];
}
export function luminance(color: string) {
  return rgb(color).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i]!, 0);
}
export const contrast = (a: string, b: string) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
/**
 * The ONE form shade per colour: same hue, darker. Near-black colours cannot go darker visibly,
 * so they step lighter instead; the result is still a single same-hue companion tone.
 */
export function formShade(color: string) {
  const [h, s, l] = toHsl(rgb(color));
  return hex(fromHsl([h, s, l < 0.16 ? l + 0.09 : l * 0.74]));
}
/** A stripe colour that stays visible on the base: secondary, else accent, else off-white/charcoal. */
export function patternColor(colors: ArtColors) {
  if (contrast(colors.primary, colors.secondary) >= 1.6) return colors.secondary;
  if (contrast(colors.primary, colors.accent) >= 1.6) return colors.accent;
  return contrast(colors.primary, OFF_WHITE) >= contrast(colors.primary, CHARCOAL) ? OFF_WHITE : CHARCOAL;
}
export function secondPatternColor(colors: ArtColors, first: string) {
  for (const c of [colors.accent, colors.secondary, OFF_WHITE, CHARCOAL]) if (c !== first && contrast(colors.primary, c) >= 1.6 && contrast(first, c) >= 1.3) return c;
  return OFF_WHITE;
}
/** Light, soft blue portrait backdrop, or a pale tint of the team primary. */
export function portraitBackdrop(colors: ArtColors, mode: 'blue' | 'team'): [string, string] {
  if (mode === 'blue') return ['#DCEBF7', '#A8CBE8'];
  const [h, s] = toHsl(rgb(colors.primary));
  return [hex(fromHsl([h, Math.min(s, .45), .9])), hex(fromHsl([h, Math.min(s, .4), .76]))];
}
