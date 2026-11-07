import type {VisualTheme} from '../design/tokens';
import type {Tone} from '../../simulation/teamScreen';

const lum = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  .map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((s, c, i) => s + c * [.2126, .7152, .0722][i]!, 0);
export const contrast = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
/** Readable text on a team-coloured surface. */
export const inkOn = (color: string) => contrast(color, '#FFFFFF') >= contrast(color, '#07090D') ? '#FFFFFF' : '#07090D';
export const toneColor = (ui: VisualTheme, tone: Tone) => tone === 'good' ? ui.green : tone === 'even' ? ui.gold : ui.caution;
/** Mix a team colour toward the surface, for portrait tints (presentation only; the canonical palette is unchanged). */
export function tint(color: string, toward: string, amount: number) {
  const c = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  return '#' + [1, 3, 5].map(i => Math.round(c(color, i) * (1 - amount) + c(toward, i) * amount).toString(16).padStart(2, '0')).join('');
}
