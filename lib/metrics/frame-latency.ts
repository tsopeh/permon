import { Metric } from './metric'

export interface FrameLatencyData {
  current: number
  mean: number
  lowest: number
  highest: number
}

export const frameLatency: () => Metric<FrameLatencyData> = () => {

  let _lowest = +Infinity
  let _highest = -Infinity
  let _mean = 0
  let _count = 0

  return (samples) => {
    const currLatency = samples[samples.length - 1] - samples[samples.length - 2]
    if (currLatency < _lowest) {
      _lowest = currLatency
    }
    if (currLatency > _highest) {
      _highest = currLatency
    }
    _count++
    _mean = _mean * (_count - 1) / _count + currLatency / _count
    return {
      current: currLatency,
      mean: _mean,
      lowest: _lowest,
      highest: _highest,
    }
  }

}