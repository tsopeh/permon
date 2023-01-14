import { BasicStats } from './basic-stats'
import { Metric } from './types'

/**
 * More info on memory estimation: https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory
 */
export const memory: Metric<BasicStats | null> = () => {
  try {
    const memory = (performance as any).memory
    return {
      current: memory.usedJSHeapSize,
      mean: -1, // TODO
      highest: memory.totalJSHeapSize,
      lowest: 0,
    }
  } catch (error) {
  }
  return null
}