import { roundToInt } from '../../utils'
import { Panel } from '../types'

export interface BasicStats {
  current: number
  mean: number
  lowest: number
  highest: number
}

export interface PanelConfig {
  title?: string
  valueFormatter?: (value: number) => string
  delayBetweenDomUpdatesMs?: number
  backgroundColor?: string
  foregroundColor?: string
}

export interface PanelConfig_Normalized {
  title: string
  valueFormatter: (value: number) => string
  delayBetweenDomUpdatesMs: number
  backgroundColor: string
  foregroundColor: string
}

function normalizeConfig (input?: PanelConfig): PanelConfig_Normalized {
  return {
    title: input?.title ?? 'N/A',
    valueFormatter: input?.valueFormatter ?? ((value) => value.toString()),
    delayBetweenDomUpdatesMs: input?.delayBetweenDomUpdatesMs ?? 50,
    backgroundColor: input?.backgroundColor ?? '#0000ff',
    foregroundColor: input?.foregroundColor ?? '#00ff00',
  }
}

export type BasicStatsPanel = Panel<BasicStats | null>

export function createBasicStatsPanel (_config: PanelConfig): BasicStatsPanel {

  const { title, valueFormatter, delayBetweenDomUpdatesMs, backgroundColor, foregroundColor } = normalizeConfig(_config)

  const pixelRatio = Math.ceil(1 / (window.devicePixelRatio ?? 1))
  const upscaleFactor = pixelRatio + 1

  const _rawCanvasWidth = 120
  const _rawCanvasHeight = 60
  const canvasWidth = upscaleFactor * _rawCanvasWidth
  const canvasHeight = upscaleFactor * _rawCanvasHeight
  const textX = upscaleFactor * 3
  const textY = upscaleFactor * 3
  const fontSize = upscaleFactor * 10
  const graphX = upscaleFactor * 3
  const graphY = 2 * textY + fontSize
  const graphWidth = (canvasWidth - 2 * graphX)
  const graphHeight = canvasHeight - graphY - textY
  const graphLineThickness = upscaleFactor * 1
  const graphLinesSpacing = upscaleFactor

  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  canvas.style.width = pixelRatio * _rawCanvasWidth + 'px'
  canvas.style.height = pixelRatio * _rawCanvasHeight + 'px'

  const context = canvas.getContext('2d')

  if (context == null) {
    throw new Error('Canvas context not found.')
  }

  context.font = 'bold ' + fontSize + 'px monospace'
  context.textBaseline = 'top'

  context.fillStyle = backgroundColor
  context.fillRect(0, 0, canvasWidth, canvasHeight)

  context.fillStyle = foregroundColor
  context.fillText(title, textX, textY)
  context.fillRect(graphX, graphY, graphWidth, graphHeight)

  context.fillStyle = backgroundColor
  context.globalAlpha = 0.9
  context.fillRect(graphX, graphY, graphWidth, graphHeight)

  let _tLatestUpdate = -Infinity

  return {
    dom: canvas,
    updateDom: (basicStats) => {
      const t = performance.now()
      // Update once every 50 ms.
      if (basicStats == null || _tLatestUpdate + delayBetweenDomUpdatesMs > t) {
        return
      } else {
        _tLatestUpdate = t
      }

      const { current: value, lowest: min, highest: max } = basicStats

      context.fillStyle = backgroundColor
      context.globalAlpha = 1
      context.fillRect(0, 0, canvasWidth, graphY)
      context.fillStyle = foregroundColor
      context.fillText(`${title} (${valueFormatter(min)}-${valueFormatter(max)}) ${valueFormatter(value)}`, textX, textY)

      context.drawImage(canvas, graphX + graphLinesSpacing, graphY, graphWidth - graphLinesSpacing, graphHeight, graphX, graphY, graphWidth - graphLinesSpacing, graphHeight)

      context.fillRect(graphX + graphWidth - graphLineThickness, graphY, graphLineThickness, graphHeight)

      context.fillStyle = backgroundColor
      context.globalAlpha = 0.9
      context.fillRect(graphX + graphWidth - graphLineThickness, graphY, graphLineThickness, roundToInt((1 - (value / max)) * graphHeight))
    },
  }

}
