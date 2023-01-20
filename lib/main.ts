import { DEFAULTS } from './defaults'
import { MetricCalculator, MonitoredMetrics, Panel } from './metrics'

export interface PermonConfig {
  metrics?: Record<string, MetricCalculator<any> | { gui?: Panel<any>, calculator: MetricCalculator<any> }>
  headless?: boolean
  styleAndAppendDomContainer?: (container: HTMLDivElement) => void
  onPublishStats?: (stats: Record<string, any>) => void
  minDelayMsBetweenPublishingStats?: number
}

interface PermonConfig_Normalized {
  metrics: MonitoredMetrics
  headless: boolean
  styleAndAppendDomContainer: (container: HTMLDivElement) => void
  onPublishStats: ((stats: Record<string, any>) => void)
  minDelayMsBetweenPublishingStats: number
}

function normalizeConfig (input?: PermonConfig): PermonConfig_Normalized {
  return {
    metrics: input?.metrics == null
      ? {
        fps: DEFAULTS.metrics.createFpsMetric(),
        frameLatency: DEFAULTS.metrics.createFrameLatencyMetric(),
        memory: DEFAULTS.metrics.createMemoryMetric(),
      }
      : Object.entries(input.metrics).reduce((acc, [key, rawMetric]) => {
        return {
          ...acc,
          [key]: rawMetric instanceof Function
            ? { calculator: rawMetric }
            : { gui: rawMetric.gui, calculator: rawMetric.calculator },
        }
      }, {} as MonitoredMetrics),
    headless: input?.headless ?? false,
    styleAndAppendDomContainer: input?.styleAndAppendDomContainer ?? ((container: HTMLDivElement) => {
      container.style.cssText = 'display:flex;gap:4px;position:fixed;top:4px;left:4px;opacity:0.9;pointer-events:none;'
      document.body.appendChild(container)
    }),
    onPublishStats: input?.onPublishStats ?? (() => { }),
    minDelayMsBetweenPublishingStats: Math.max(0, input?.minDelayMsBetweenPublishingStats ?? 1000),
  }
}

export class Permon {

  private rafId: number | null = null
  private domContainer: HTMLElement | null = null

  public static readonly DEFAULTS = DEFAULTS

  public constructor (_config?: PermonConfig) {

    const config = normalizeConfig(_config)

    if (!config.headless) {
      const container = document.createElement('div')
      for (const [_, { gui }] of Object.entries(config.metrics)) {
        if (gui?.dom != null) {
          container.appendChild(gui.dom)
        }
      }
      config.styleAndAppendDomContainer(container)
    }

    let tLatestPublish: number = -Infinity

    const onAnimationFrame = () => {
      const t = performance.now()
      const stats: Record<string, MetricCalculator<any>> = {}
      for (const [key, { calculator, gui }] of Object.entries(config.metrics)) {
        const value = calculator(t)
        stats[key] = value
        if (!config.headless && gui != null) {
          gui.updateDom(value)
        }
      }
      if (tLatestPublish + config.minDelayMsBetweenPublishingStats <= t) {
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
    this.rafId = null
    this.domContainer?.remove()
  }

}