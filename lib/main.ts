import { fps, frameLatency, memory, Metric } from './metrics'

export interface PermonConfig {
  headless?: boolean
  onPublishStats?: (stats: Record<string, any>) => void
  minDelayMsBetweenPublishingStats?: number
  metrics?: Record<string, Metric<any>>
}

interface PermonConfig_Normalized {
  headless: boolean
  onPublishStats: ((stats: Record<string, any>) => void)
  minDelayMsBetweenPublishingStats: number
  metrics: Record<string, Metric<any>>
}

function normalizeConfig (input?: PermonConfig): PermonConfig_Normalized {
  const defaultMetrics: Record<string, Metric<any>> = {
    fps: fps(),
    frameLatency: frameLatency(),
    memory,
  }
  return {
    headless: input?.headless ?? false,
    onPublishStats: input?.onPublishStats ?? (() => { }),
    minDelayMsBetweenPublishingStats: Math.max(0, input?.minDelayMsBetweenPublishingStats ?? 1000),
    metrics: input?.metrics ?? defaultMetrics,
  }
}

export class Permon {

  private reqId: number | null = null

  public constructor (_config?: PermonConfig) {

    const config = normalizeConfig(_config)

    let tLatestPublish: number | null = null

    const onAnimationFrame = () => {
      const t = performance.now()
      const stats: Record<string, Metric<any>> = {}
      for (const [key, metric] of Object.entries(config.metrics)) {
        stats[key] = metric(t)
      }
      if (tLatestPublish == null || tLatestPublish + config.minDelayMsBetweenPublishingStats <= t) {
        config.onPublishStats(stats)
        tLatestPublish = t
      }
      this.reqId = requestAnimationFrame(onAnimationFrame)
    }

    this.reqId = requestAnimationFrame(onAnimationFrame)

  }

  public destroy () {
    if (this.reqId != null) {
      cancelAnimationFrame(this.reqId)
    }
  }

}