import { onDocumentVisibilityChange } from '../utils'
import { BasicStats } from './basic-stats'
import { Metric } from './types'

export const fps: () => Metric<BasicStats | null> = () => {

  let _isStable = false
  const _sampleWindow: Array<number> = []

  let _lowest = Infinity
  let _highest = 0
  let _count = 0
  let _mean = 0

  let isDocumentVisible = onDocumentVisibilityChange((isVisible) => {
    isDocumentVisible = isVisible
    _isStable = false
    _sampleWindow.length = 0
  })

  return (t) => {
    if (!isDocumentVisible) {
      return null
    }
    _sampleWindow.push(t)
    let elapsedFromOldest = t - _sampleWindow[0]
    if (!_isStable) {
      if (elapsedFromOldest >= 1900) {
        _isStable = true
      } else {
        return null
      }
    }
    while (elapsedFromOldest >= 1000) {
      _sampleWindow.shift()
      elapsedFromOldest = t - _sampleWindow[0]
    }
    const currFps = _sampleWindow.length
    _count++
    _mean = _mean * (_count - 1) / _count + currFps / _count
    _lowest = Math.min(_lowest, currFps)
    _highest = Math.max(_highest, currFps)
    return {
      current: currFps,
      mean: _mean,
      lowest: _lowest,
      highest: _highest,
    }
  }

}