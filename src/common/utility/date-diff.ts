
export function getDateDayDiff(date1: Date, date2: Date = new Date()): number {
  date1.setHours(0, 0, 0, 0)
  date2.setHours(0, 0, 0, 0)

  return (date1.getTime() - date2.getTime()) / 86400000
}
