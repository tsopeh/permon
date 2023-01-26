import { BasicStats, MetricCalculator } from '../types'

/**
 * More info on memory estimation: https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory
 */
export const createMemoryCalculator = () => {

  let _lowest = Infinity
  let _highest = 0
  let _count = 0
  let _mean = 0

  const metric: MetricCalculator<BasicStats | null> = () => {
    try {
      const memory = (performance as any).memory
      const currMem = memory.usedJSHeapSize
      _count++
      _mean = _mean * (_count - 1) / _count + currMem / _count
      _lowest = Math.min(_lowest, currMem)
      _highest = Math.max(_highest, currMem)
      return {
        current: currMem,
        mean: _mean,
        highest: _highest,
        lowest: _lowest,
      }
    } catch (error) {
    }
    return null
  }

  return metric

}