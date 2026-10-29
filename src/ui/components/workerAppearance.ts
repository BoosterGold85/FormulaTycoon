/** Stable cosmetic variation only; this never seeds or changes simulation outcomes. */
const SKIN = ['#E6AE88', '#AD7250', '#D59A73', '#8E5B45', '#BC825D', '#694A3C'];
const HAIR = ['#322A2B', '#60412D', '#C2935A', '#1C2229', '#773E30'];
export function workerAppearance(id: string, role: string) {
  const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    skin: SKIN[index % SKIN.length],
    hair: HAIR[index % HAIR.length],
    longHair: index % 3 === 0,
    headset: /engineer|strategist/i.test(role),
    cap: /mechanic|logistics/i.test(role),
    hiVis: /logistics/i.test(role),
    overalls: /mechanic|manufacturing/i.test(role)
  };
}
