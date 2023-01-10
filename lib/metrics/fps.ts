import { Metric } from './metric'

export interface FpsData {
  current: number
  mean: number
  lowest: number
  highest: number
}

export const fps: () => Metric<FpsData> = () => {

  let _lowest: number = Infinity
  let _highest: number = -Infinity
  let _count = 0
  let _mean = 0

  return (samples) => {
    const tLatest = samples[samples.length - 1]
    const timeThreshold = tLatest - 1000
    let currFps = 0
    for (let i = samples.length - 1; i >= 0; i--) {
      const t = samples[i]
      if (t > timeThreshold) {
        currFps++
      }
    }
    if (currFps < _lowest) {
      _lowest = currFps
    }
    if (currFps > _highest) {
      _highest = currFps
    }
    _count++
    _mean = _mean * (_count - 1) / _count + currFps / _count
    return {
      current: currFps,
      mean: _mean,
      lowest: _lowest,
      highest: _highest,
    }
  }

}