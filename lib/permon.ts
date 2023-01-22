import { MonitoredMetrics, UnwrapMonitoredMetrics } from './metrics'
import { UTILS } from './utils'

export interface PermonConfig<T extends MonitoredMetrics> {
  metrics?: T
  headless?: boolean
  styleAndAppendDomContainer?: (container: HTMLDivElement) => void
  onPublishStats?: (stats: UnwrapMonitoredMetrics<T>) => void
  minDelayMsBetweenPublishingStats?: number
  skipGreeting?: boolean
}

interface PermonConfig_Normalized<T extends MonitoredMetrics> {
  metrics: T
  headless: boolean
  styleAndAppendDomContainer: (container: HTMLDivElement) => void
  onPublishStats: (stats: UnwrapMonitoredMetrics<T>) => void
  minDelayMsBetweenPublishingStats: number
  skipGreeting: boolean
}

const normalizeConfig = <T extends MonitoredMetrics> (input?: PermonConfig<T>): PermonConfig_Normalized<T> => {
  return {
    metrics: input?.metrics == null
      ? UTILS.metrics.createAllDefaultMetrics()
      : Object.entries(input.metrics).reduce((acc, [key, rawMetric]) => {
        return {
          ...acc,
          [key]: { panel: rawMetric.panel, calculator: rawMetric.calculator },
        }
      }, {} as any),
    headless: input?.headless ?? false,
    styleAndAppendDomContainer: input?.styleAndAppendDomContainer ?? ((container: HTMLDivElement) => {
      container.style.cssText = 'z-index:5100;display:flex;gap:4px;position:fixed;top:4px;left:4px;opacity:0.9;pointer-events:none;'
      document.body.appendChild(container)
    }),
    onPublishStats: input?.onPublishStats ?? (() => { }),
    minDelayMsBetweenPublishingStats: Math.max(0, input?.minDelayMsBetweenPublishingStats ?? 1000),
    skipGreeting: input?.skipGreeting ?? false,
  }
}

export class Permon<T extends MonitoredMetrics> {

  private rafId: number | null = null
  private domContainer: HTMLElement | null = null

  public static readonly UTILS = UTILS

  public constructor (_config?: PermonConfig<T>) {

    const config = normalizeConfig(_config)

    if (!config.headless) {
      const container = document.createElement('div')
      for (const [_, { panel }] of Object.entries(config.metrics)) {
        if (panel?.dom != null) {
          container.appendChild(panel.dom)
        }
      }
      config.styleAndAppendDomContainer(container)
    }

    let tLatestPublish: number = -Infinity

    const onAnimationFrame = () => {
      const t = performance.now()
      const stats = {} as UnwrapMonitoredMetrics<T>
      for (const [key, { calculator, panel }] of Object.entries(config.metrics)) {
        const value = calculator(t)
        stats[key as keyof T] = value
        if (!config.headless && panel != null) {
          panel.updateDom(value)
        }
      }
      if (tLatestPublish + config.minDelayMsBetweenPublishingStats <= t) {
        config.onPublishStats(stats)
        tLatestPublish = t
      }
      this.rafId = requestAnimationFrame(onAnimationFrame)
    }

    this.rafId = requestAnimationFrame(onAnimationFrame)

    if (!config.skipGreeting) {
      console.log(`Permon (${UTILS.permonVersion}) has started monitoring the page performance.`)
    }

  }

  public destroy () {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId)
    }
    this.rafId = null
    this.domContainer?.remove()
  }

}
