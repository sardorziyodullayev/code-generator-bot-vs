/**
 * Returns a string.
 * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
 */
export function numberFormat(
  number: number,
  fractionDigits = 0,
  dsep = ".",
  tsep = ",",
) {
  if (
    isNaN(number) ||
    (typeof number !== "number" && typeof number !== "bigint")
  )
    return "";

  const numStr = number.toFixed(fractionDigits);
  let pindex = numStr.indexOf("."),
    fnums: string[],
    decimals: string;
  const parts: string[] = [];

  if (pindex > -1) {
    fnums = numStr.substring(0, pindex).split("");
    decimals = dsep + numStr.substr(pindex + 1);
  } else {
    fnums = numStr.split("");
    decimals = "";
  }

  do {
    parts.unshift(fnums.splice(-3, 3).join(""));
  } while (fnums.length);

  return parts.join(tsep) + decimals;
}

export function numberWithZero(num: number, zeroLen: number): string {
  if (isNaN(num)) return "";

  let zeros = "";

  for (let i = 0; i < zeroLen; i++) {
    zeros += "0";
  }

  return `${zeros}${num}`;
}
