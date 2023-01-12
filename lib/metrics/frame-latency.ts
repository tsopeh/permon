import { onDocumentVisibilityChange } from '../utils'
import { Metric } from './metric'

export interface FrameLatencyData {
  current: number
  mean: number
  lowest: number
  highest: number
}

export const frameLatency: () => Metric<FrameLatencyData | null> = () => {

  let _isStable = false
  let _tFirstVisible = Infinity
  let _prev = Infinity
  let _curr = Infinity

  let _lowest = +Infinity
  let _highest = -Infinity
  let _mean = 0
  let _count = 0

  let isDocumentVisible = onDocumentVisibilityChange((isVisible) => {
    isDocumentVisible = isVisible
    _tFirstVisible = Infinity
    _isStable = false
    _count = 0
  })

  return (t) => {
    if (!isDocumentVisible) {
      _tFirstVisible = Infinity
      _isStable = false
      _count = 0
      return null
    }
    _prev = _curr
    _curr = t
    if (!_isStable) {
      _tFirstVisible = Math.min(_tFirstVisible, t)
      if (t - _tFirstVisible >= 1000) {
        _isStable = true
      } else {
        return null
      }
    }
    const currLatency = _curr - _prev
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