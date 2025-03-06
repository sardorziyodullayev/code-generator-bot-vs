const correctDate = (num: number) => num < 10 ? `0${num}` : num

export function getDateYYYYMMDD(date: Date, separator = "-"): string {
  return `${date.getFullYear()}${separator}${correctDate(date.getMonth() + 1)}${separator}${correctDate(date.getDate())}`
}

export function getDateMMDDYYYY(date: Date | string, separator = "-"): string {
  date = new Date(date)
  return `${correctDate(date.getMonth() + 1)}${separator}${correctDate(date.getDate())}${separator}${date.getFullYear()}`
}

export function getDateDDMMYYYY(date: Date, separator = "-"): string {
  return `${correctDate(date.getDate())}${separator}${correctDate(date.getMonth() + 1)}${separator}${date.getFullYear()}`
}
