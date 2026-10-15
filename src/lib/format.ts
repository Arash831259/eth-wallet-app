/** 0x1234…abcd */
export function shorten(value: string, head = 6, tail = 4): string {
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Trim a decimal string to at most `max` fractional digits, dropping trailing zeros. */
export function trimDecimals(value: string, max = 6): string {
  const [whole, fraction = ""] = value.split(".");
  const cut = fraction.slice(0, max).replace(/0+$/, "");
  return cut ? `${whole}.${cut}` : whole;
}
