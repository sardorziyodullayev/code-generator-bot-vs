const lettersKril = {
  0: "ноль",
  1: "бир",
  2: "икки",
  3: "уч",
  4: "тўрт",
  5: "беш",
  6: "олти",
  7: "етти",
  8: "саккиз",
  9: "тўққиз",
};

const lettersLotin = {
  0: "nol",
  1: "bir",
  2: "ikki",
  3: "uch",
  4: "to'rt",
  5: "besh",
  6: "olti",
  7: "yetti",
  8: "sakkiz",
  9: "to'qqiz",
};

const decimalsKril = {
  0: "ноль",
  1: "ўн",
  2: "йигирма",
  3: "ўттиз",
  4: "қирқ",
  5: "еллик",
  6: "олтмиш",
  7: "етмиш",
  8: "саксон",
  9: "тўқсон",
};

const decimalsLotin = {
  0: "nol",
  1: "o'n",
  2: "yigirma",
  3: "o'ttiz",
  4: "qirq",
  5: "ellik",
  6: "oltmish",
  7: "yetmish",
  8: "sakson",
  9: "to'qson",
};

const thousandsKril = [
  "",
  "минг",
  "миллион",
  "миллиард",
  "трилион",
  "квадриллион",
  "квинтиллион",
  "секстиллион",
  "септиллион",
  "октиллион",
  "нониллион",
  "декалион",
  "ундециллион",
  "додециллион",
  "тредециллион",
  "кваттуордециллион",
  // "квиндециллион",
  // "сексдециллион",
  // "септдециллион",
  // "октодециллион",
  // "новемдециллион",
  // "вигин",
];

const thousandsLotin = [
  "",
  "ming",
  "million",
  "milliard",
  "trilion",
  "kvadrillion",
  "kvintillion",
  "sekstillion",
  "septillion",
  "oktillion",
  "nonillion",
  "dekalion",
  "undetsillion",
  "dodetsillion",
  "tredetsillion",
  "kvattuordetsillion",
  // "квиндециллион",
  // "сексдециллион",
  // "септдециллион",
  // "октодециллион",
  // "новемдециллион",
  // "вигин",
];

export function numToUzbekLetter(
  num: number | string,
  alphabet: "lotin" | "kril",
) {
  let letters: any, decimals: any, thousands: any;
  let yuz = "yuz";

  if (alphabet === "lotin") {
    letters = lettersLotin;
    decimals = decimalsLotin;
    thousands = thousandsLotin;
  } else {
    letters = lettersKril;
    decimals = decimalsKril;
    thousands = thousandsKril;
    yuz = "юз";
  }

  num = Number(num);

  if (
    Number.isNaN(num) ||
    (typeof num !== "bigint" && typeof num !== "number")
  ) {
    return "Invalid number";
  }

  let beginStr = "";

  if (num < 0) {
    beginStr = "minus";
    num = Math.abs(num);
  }

  if (num === 0) {
    return letters[num];
  }

  let letterStr = "";
  let groupCount = 0;

  while (num > 0) {
    let group = num % 1000;

    if (group > 0) {
      let groupLetterStr = "";

      if (group >= 100) {
        groupLetterStr += ` ${letters[Math.floor(group / 100)]} ${yuz}`;
        group %= 100;
        if (group > 0) {
          groupLetterStr += " ";
        }
      }

      if (group >= 10) {
        groupLetterStr += ` ${decimals[Math.floor(group / 10)]}`;
        group %= 10;
        if (group > 0) {
          groupLetterStr += " ";
        }
      }

      if (group > 0) {
        groupLetterStr += ` ${letters[group]}`;
      }

      if (groupCount > 0) {
        groupLetterStr += ` ${thousands[groupCount]}`;
      }
      // if (letterStr !== "") {
      //   letterStr = `${letterStr}`;
      // }

      letterStr = groupLetterStr + letterStr;
    }

    num = Math.floor(num / 1000);
    groupCount++;
  }

  return `${beginStr}${letterStr}`.trim();
}
