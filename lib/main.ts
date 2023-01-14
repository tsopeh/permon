import { fps, frameLatency, memory, Metric } from './metrics'

export interface PermonConfig {
  headless?: boolean
  onPublishStats?: (stats: Record<string, any>) => void
  minDelayMsBetweenPublishingStats?: number
  metrics?: Record<string, Metric<any> | { gui?: unknown, metric: Metric<any> }>
}

type NormalizedMetrics = Record<string, { gui: unknown, metric: Metric<any> }>

interface PermonConfig_Normalized {
  headless: boolean
  onPublishStats: ((stats: Record<string, any>) => void)
  minDelayMsBetweenPublishingStats: number
  metrics: NormalizedMetrics
}

const GET_DEFAULT_METRICS = (): NormalizedMetrics => {
  return {
    fps: { gui: null, metric: fps() },
    frameLatency: { gui: null, metric: frameLatency() },
    memory: { gui: null, metric: memory },
  }
}

function normalizeConfig (input?: PermonConfig): PermonConfig_Normalized {
  return {
    headless: input?.headless ?? false,
    onPublishStats: input?.onPublishStats ?? (() => { }),
    minDelayMsBetweenPublishingStats: Math.max(0, input?.minDelayMsBetweenPublishingStats ?? 1000),
    metrics: input?.metrics == null
      ? GET_DEFAULT_METRICS()
      : Object.entries(input.metrics).reduce((acc, [key, rawMetric]) => {
        return {
          ...acc,
          [key]: rawMetric instanceof Function
            ? { gui: null, metric: rawMetric }
            : { gui: rawMetric.gui ?? null, metric: rawMetric.metric },
        }
      }, {} as NormalizedMetrics),
  }
}

export class Permon {

  private rafId: number | null = null

  public static readonly getDefaultMetrics = GET_DEFAULT_METRICS

  public constructor (_config?: PermonConfig) {

    const config = normalizeConfig(_config)

    let tLatestPublish: number | null = null

    const onAnimationFrame = () => {
      const t = performance.now()
      const stats: Record<string, Metric<any>> = {}
      for (const [key, { metric }] of Object.entries(config.metrics)) {
        stats[key] = metric(t)
      }
      if (tLatestPublish == null || tLatestPublish + config.minDelayMsBetweenPublishingStats <= t) {
        config.onPublishStats(stats)
        tLatestPublish = t
      }
      this.rafId = requestAnimationFrame(onAnimationFrame)
    }

    this.rafId = requestAnimationFrame(onAnimationFrame)

  }

  public destroy () {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId)
    }
  }

}