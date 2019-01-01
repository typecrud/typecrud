export function convertDates(obj: any) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] instanceof Date) {
      obj[key] = obj[key].toISOString()
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      obj[key] = convertDates(obj[key])
    }
  }

  return obj
}
