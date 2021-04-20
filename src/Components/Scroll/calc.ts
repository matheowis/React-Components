export const lerp = (a: number, b: number, alpha: number) => a + (b - a) * alpha;
export const clamp = (val: number, min: number, max: number) => val > max ? max : val < min ? min : val;