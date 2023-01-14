import { createBasicStatsPanel, fps, frameLatency, memory, Metric, Panel } from './metrics'
import { roundToInt, simpleNumberFormatter } from './utils'

type MonitoredMetrics = Record<string, { gui?: Panel<any>, metric: Metric<any> }>

export interface PermonConfig {
  metrics?: Record<string, Metric<any> | { gui?: Panel<any>, metric: Metric<any> }>
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

const GET_DEFAULT_METRICS = (): MonitoredMetrics => {
  return {
    fps: {
      gui: createBasicStatsPanel({
        title: 'fps',
        valueFormatter: simpleNumberFormatter,
        backgroundColor: '#181d37',
        foregroundColor: '#6ef8fc',
      }),
      metric: fps(),
    },
    frameLatency: {
      gui: createBasicStatsPanel({
        title: 'lat',
        valueFormatter: simpleNumberFormatter,
        backgroundColor: '#22361a',
        foregroundColor: '#78f123',
      }),
      metric: frameLatency(),
    },
    memory: {
      gui: createBasicStatsPanel({
        title: 'mem',
        valueFormatter: (value) => (roundToInt(value * 0.000001)).toString(),
        backgroundColor: '#341e2a',
        foregroundColor: '#ec5499',
      }),
      metric: memory,
    },
  }
}

function normalizeConfig (input?: PermonConfig): PermonConfig_Normalized {
  return {
    metrics: input?.metrics == null
      ? GET_DEFAULT_METRICS()
      : Object.entries(input.metrics).reduce((acc, [key, rawMetric]) => {
        return {
          ...acc,
          [key]: rawMetric instanceof Function
            ? { metric: rawMetric }
            : { gui: rawMetric.gui, metric: rawMetric.metric },
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

  public static readonly DEFAULTS = {
    getDefaultMetrics: GET_DEFAULT_METRICS,
    formatters: {
      simpleNumberFormatter,
    },
  }

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
      const stats: Record<string, Metric<any>> = {}
      for (const [key, { metric, gui }] of Object.entries(config.metrics)) {
        const value = metric(t)
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