import { Metric } from './metric'

export type MemoryData =
  | null
  | {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

/**
 * More info on memory estimation: https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory
 */
export const memory: Metric<MemoryData> = () => {
  try {
    const memory = (performance as any).memory
    return {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
    }
  } catch (error) {
  }
  return null
}