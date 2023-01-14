export type Metric<T> = (t: number) => T

export type Panel<T> = {
  dom: HTMLElement
  updateDom: (metricData: T) => void
}
