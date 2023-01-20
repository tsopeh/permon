export type MetricCalculator<T> = (t: number) => T

export type Panel<T> = {
  dom: HTMLElement
  updateDom: (metricData: T) => void
}

export type MonitoredMetrics = Record<string, { gui?: Panel<any>, calculator: MetricCalculator<any> }>