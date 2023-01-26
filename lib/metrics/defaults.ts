import { integerFormatter, roundToInt } from '../utils'
import { createBasicStatsPanel } from './basic-stats/basic-stats-panel'
import { createFpsCalculator } from './basic-stats/fps'
import { createFrameLatencyCalculator } from './basic-stats/frame-latency'
import { createMemoryCalculator } from './basic-stats/memory'
import { MonitoredMetrics } from './types'

const fps = {
  createCalculator: createFpsCalculator,
  createPanel: () => {
    return createBasicStatsPanel({
      title: 'FPS',
      valueFormatter: integerFormatter,
      backgroundColor: '#181d37',
      foregroundColor: '#6ef8fc',
    })
  },
}

const frameLatency = {
  createCalculator: createFrameLatencyCalculator,
  createPanel: () => {
    return createBasicStatsPanel({
      title: 'MS',
      valueFormatter: integerFormatter,
      backgroundColor: '#22361a',
      foregroundColor: '#78f123',
    })
  },
}

const memory = {
  createCalculator: createMemoryCalculator,
  createPanel: () => {
    return createBasicStatsPanel({
      title: 'MB',
      valueFormatter: (value) => (roundToInt(value * 0.000001)).toString(),
      backgroundColor: '#341e2a',
      foregroundColor: '#ec5499',
    })
  },
}

export const metricsUtils = {
  fps,
  frameLatency,
  memory,
  createAllDefaultMetrics: (): MonitoredMetrics => {
    return {
      fps: { calculator: fps.createCalculator(), panel: fps.createPanel() },
      frameLatency: { calculator: frameLatency.createCalculator(), panel: frameLatency.createPanel() },
      memory: { calculator: memory.createCalculator(), panel: memory.createPanel() },
    }
  },
  createBasicStatsPanel,
}