export const fmt = (n: number) => n.toLocaleString('en-US');
export const signed = (n: number, digits = 1) => `${n > 0 ? '+' : n < 0 ? '\u2212' : ''}${Math.abs(n).toFixed(digits)}`;
