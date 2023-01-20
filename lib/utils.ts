export function onDocumentVisibilityChange (callback: (isDocumentVisible: boolean) => void): boolean {

  document.addEventListener('visibilitychange', () => {
    callback(!document.hidden)
  })

  return !document.hidden
}

export const roundDecimal = (decimalPlaces: number) => (x: number): number => {
  const decimalDivider = Math.pow(10, decimalPlaces)
  return Math.round((x * decimalDivider + Number.EPSILON) / decimalDivider)
}

export const roundToInt = roundDecimal(0)

export function integerFormatter (x: number): string {
  return roundToInt(x).toString()
}

export const roundToTwoDecimalPlaces = roundDecimal(2)

export function roundToTwoDecimalPlacesFormatter (x: number): string {
  return roundToTwoDecimalPlaces(x).toString()
}

