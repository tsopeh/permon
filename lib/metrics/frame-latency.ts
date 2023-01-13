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
  let _tPrev = Infinity
  let _tCurr = Infinity

  let _lowest = +Infinity
  let _highest = -Infinity
  let _count = 0
  let _mean = 0

  let isDocumentVisible = onDocumentVisibilityChange((isVisible) => {
    isDocumentVisible = isVisible
    _isStable = false
    _tFirstVisible = Infinity
    _tPrev = Infinity
    _tCurr = Infinity
  })

  return (t) => {
    if (!isDocumentVisible) {
      return null
    }
    _tPrev = _tCurr
    _tCurr = t
    if (!_isStable) {
      _tFirstVisible = Math.min(_tFirstVisible, t)
      if (t - _tFirstVisible >= 1900) {
        _isStable = true
      } else {
        return null
      }
    }
    const currLatency = _tCurr - _tPrev
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