import { metricsUtils } from './metrics/defaults'

export const onDocumentVisibilityChange = (callback: (isDocumentVisible: boolean) => void): boolean => {

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

export const integerFormatter = (x: number): string => roundToInt(x).toString()

export const roundToTwoDecimalPlaces = roundDecimal(2)

export const roundToTwoDecimalPlacesFormatter = (x: number): string => roundToTwoDecimalPlaces(x).toString()

export const UTILS = {
  permonVersion: import.meta.env.__PERMON_VERSION__,
  metrics: metricsUtils,
  formatters: {
    roundDecimal,
    integerFormatter,
    roundToTwoDecimalPlacesFormatter,
  },
  onDocumentVisibilityChange,
}
