export const iso = (d: Date): string => d.toISOString().slice(0, 10);

export const quarterOf = (date: string): 1 | 2 | 3 | 4 => {
  const m = new Date(date).getMonth() + 1;
  return Math.ceil(m / 3) as 1 | 2 | 3 | 4;
};
