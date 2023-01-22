export type MetricCalculator<TStats> = (t: number) => TStats

export type Panel<TStats> = {
  dom: HTMLElement
  updateDom: (stats: TStats) => void
}

export type CalculatorAndPanel<TStats> = { calculator: MetricCalculator<TStats>, panel?: Panel<TStats> }

export type MonitoredMetrics = Record<string, CalculatorAndPanel<any>>

export type UnwrapMonitoredMetrics<T extends MonitoredMetrics> = {
  [K in keyof T]: (T[K] extends CalculatorAndPanel<infer U> ? U : never)
}
