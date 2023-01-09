import {Stats} from "./stats";

export interface PerfMonConfig {
    headless?: boolean
    sampleSize?: number
    onPublishStats?: (stats: Stats) => void
    minDelayBetweenPublishingStats?: number
}

interface PerfMonConfig_Normalized {
    headless: boolean
    sampleSize: number
    onPublishStats: ((stats: Stats) => void) | null
    minDelayBetweenPublishingStats: number
}

function normalizeConfig(input?: PerfMonConfig): PerfMonConfig_Normalized {
    console.log(input)
    return {
        headless: input.headless ?? false,
        sampleSize: Math.max(0, input.sampleSize ?? 256),
        onPublishStats: input.onPublishStats ?? (() => {
        }),
        minDelayBetweenPublishingStats: Math.max(0, input.minDelayBetweenPublishingStats ?? 1000)
    }
}

export function PerfMon(_config?: PerfMonConfig) {

    const config = normalizeConfig(_config)

    const sample: Array<number> = [0]
    let tLatestPublish: number | null = null
    let reqId: number | null = null

    function onAnimationFrame() {
        const tNow = window.performance.now()
        sample.push(tNow)
        const shouldCalculateStats = sample.length >= config.sampleSize
        if (shouldCalculateStats) {
            if (tLatestPublish == null || tLatestPublish + config.minDelayBetweenPublishingStats <= tNow) {
                config.onPublishStats(calcStatsFromSample(sample))
                tLatestPublish = tNow
            }
            // Remove oldest.
            sample.shift()
        }
        reqId = requestAnimationFrame(onAnimationFrame)
    }

    reqId = requestAnimationFrame(onAnimationFrame)
    console.log('requestAnimationFrame', reqId)
    return {
        destroy: function () {
            if (reqId != null) {
                cancelAnimationFrame(reqId)
            }
        }
    }

}

function calcStatsFromSample(sample: ReadonlyArray<number>, prevStats?: Stats): Stats {
    const tOldest = sample[0]
    const tLatest = sample[sample.length - 1]
    const timeThreshold = tLatest - 1000
    let currFps = 0
    for (let i = sample.length - 1; i >= 0; i--) {
        const t = sample[i]
        if (t > timeThreshold) {
            currFps++
        }
    }
    return {
        latestFps: currFps,
        minFps: 0,
        maxFps: 0,
        averageFps: 0,
        latestTimeBetweenFramesMs: 0,
        minTimeBetweenFramesMs: 0,
        maxTimeBetweenFrames: 0,
        averageTimeBetweenFramesMs: 0
    }
}