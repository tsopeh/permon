import { createBasicStatsPanel, fps, frameLatency, memory } from './metrics'
import { integerFormatter, roundToInt, roundToTwoDecimalPlacesFormatter } from './utils'

export const DEFAULTS = {
  metrics: {
    createFpsMetric: () => {
      return {
        gui: createBasicStatsPanel({
          title: 'fps',
          valueFormatter: integerFormatter,
          backgroundColor: '#181d37',
          foregroundColor: '#6ef8fc',
        }),
        metric: fps(),
      }
    },
    createFrameLatencyMetric: () => {
      return {
        gui: createBasicStatsPanel({
          title: 'lat',
          valueFormatter: integerFormatter,
          backgroundColor: '#22361a',
          foregroundColor: '#78f123',
        }),
        metric: frameLatency(),
      }
    },
    createMemoryMetric: () => {
      return {
        gui: createBasicStatsPanel({
          title: 'mem',
          valueFormatter: (value) => (roundToInt(value * 0.000001)).toString(),
          backgroundColor: '#341e2a',
          foregroundColor: '#ec5499',
        }),
        metric: memory,
      }
    },
  },
  formatters: {
    integerFormatter,
    roundToTwoDecimalPlacesFormatter,
  },
}