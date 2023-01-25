import { metricsUtils } from './metrics'

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

export const px = (x: number): string => { return `${x}px` }

export const translate = (x: number, y: number) => `translate(${x}px, ${y}px)`

export const makeElementMovable = (element: HTMLElement) => {

  const paddingOffset = 200
  let pointerDownOffsetX = 0
  let pointerDownPaddedOffsetY = 0

  function pointerUpHandler (event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()

    const x = event.clientX - pointerDownOffsetX
    const y = event.clientY - pointerDownPaddedOffsetY

    element.style.transform = translate(x, y)
    element.style.padding = px(0)

    element.removeEventListener('pointermove', pointerMoveHandler)
    element.removeEventListener('pointerup', pointerUpHandler)

    element.addEventListener('pointerdown', pointerDownHandler)

  }

  function pointerMoveHandler (event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()

    const x = event.clientX - pointerDownOffsetX - paddingOffset
    const y = event.clientY - pointerDownPaddedOffsetY - paddingOffset

    element.style.transform = translate(x, y)
  }

  function pointerDownHandler (event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()

    pointerDownOffsetX = event.offsetX
    pointerDownPaddedOffsetY = event.offsetY

    const x = event.clientX - pointerDownOffsetX - paddingOffset
    const y = event.clientY - pointerDownPaddedOffsetY - paddingOffset

    element.style.transform = translate(x, y)
    element.style.padding = px(paddingOffset)

    element.addEventListener('pointermove', pointerMoveHandler)
    element.addEventListener('pointerup', pointerUpHandler)

    element.removeEventListener('pointerdown', pointerDownHandler)

  }

  element.addEventListener('pointerdown', pointerDownHandler)

}

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
