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

  const samples: Array<number> = [0]
  let tLatestPublish: number | null = null
  let reqId: number | null = null

  function onAnimationFrame () {
    const tNow = window.performance.now()
    samples.push(tNow)
    const shouldCalculateStats = samples.length >= config.sampleSize
    if (shouldCalculateStats) {
      if (tLatestPublish == null || tLatestPublish + config.minDelayBetweenPublishingStats <= tNow) {
        const stats: Record<string, Metric<any>> = {}
        for (const [key, metric] of Object.entries(config.metrics)) {
          stats[key] = metric(samples)
        }
        config.onPublishStats(stats)
        tLatestPublish = tNow
      }
      // Remove oldest.
      samples.shift()
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
