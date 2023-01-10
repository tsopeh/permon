import { fps, frameLatency, memory, Metric } from './metrics'

export interface PerfMonConfig {
  headless?: boolean
  sampleSize?: number
  onPublishStats?: (stats: Record<string, any>) => void
  minDelayBetweenPublishingStats?: number
  metrics?: Record<string, Metric<any>>
}

interface PerfMonConfig_Normalized {
  headless: boolean
  sampleSize: number
  onPublishStats: ((stats: Record<string, any>) => void)
  minDelayBetweenPublishingStats: number
  metrics: Record<string, Metric<any>>
}

function normalizeConfig (input?: PerfMonConfig): PerfMonConfig_Normalized {
  const defaultMetrics: Record<string, Metric<any>> = {
    fps: fps(),
    frameLatency: frameLatency(),
    memory,
  }
  return {
    headless: input?.headless ?? false,
    sampleSize: Math.max(0, input?.sampleSize ?? 256),
    onPublishStats: input?.onPublishStats ?? (() => {
    }),
    minDelayBetweenPublishingStats: Math.max(0, input?.minDelayBetweenPublishingStats ?? 1000),
    metrics: input?.metrics ?? defaultMetrics,
  }
}

export function PerfMon (_config?: PerfMonConfig) {

  const config = normalizeConfig(_config)

  const _getStableSamples = getStableSampleWindow(config.sampleSize)

  let tLatestPublish: number | null = null
  let reqId: number | null = null

  function onAnimationFrame () {
    const tNow = window.performance.now()
    const samples = _getStableSamples(tNow)
    const shouldCalculateStats = samples != null
    if (shouldCalculateStats) {
      if (tLatestPublish == null || tLatestPublish + config.minDelayBetweenPublishingStats <= tNow) {
        const stats: Record<string, Metric<any>> = {}
        for (const [key, metric] of Object.entries(config.metrics)) {
          stats[key] = metric(samples)
        }
        config.onPublishStats(stats)
        tLatestPublish = tNow
      }
    }
    reqId = requestAnimationFrame(onAnimationFrame)
  }

  reqId = requestAnimationFrame(onAnimationFrame)

  return {
    destroy: function () {
      if (reqId != null) {
        cancelAnimationFrame(reqId)
      }
    },
  }

}

function getStableSampleWindow (sampleSize: number) {
  const successiveVisibleFramesThreshold = sampleSize / 2
  let _visibleCount = 0
  const _sample: Array<number> = []
  document.addEventListener('visibilitychange', () => {
    _visibleCount = 0
    _sample.length = 0
  })
  return function onAnimationFrame (tNow: number): (ReadonlyArray<number> | null) {
    if (_visibleCount > successiveVisibleFramesThreshold) {
      _sample.push(tNow)
      if (_sample.length > sampleSize) {
        _sample.shift()
        return _sample
      } else {
        return null
      }
    } else {
      _visibleCount++
      return null
    }
  }
}