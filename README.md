# permon

A simple **per**formance **mon**itor for web apps and games. Checkout the [Configuration and usage](#configuration-and-usage) section for the detailed overview of the features.

![Permon's panels](https://i.imgur.com/iVP4rC2.png)

## Quick Start

### Package (module)

```console
yarn add permon
```

```typescript
import { Permon } from 'permon'

new Permon()
```

### Vanilla

```javascript
(function () {
  var s = document.createElement('script')
  s.onload = function () {
    new permon.Permon()
  }
  s.src = '//tsopeh.github.io/permon/dist/permon.iife.js'
  document.head.appendChild(s)
})()
```

### Bookmarklet

You can test `permon` on **any** webpage that supports [Bookmarklets](https://en.wikipedia.org/wiki/Bookmarklet), by creating a new bookmark and filling its address field with the code snippet below. Alternatively you can paste the same snippet in the browser's address bar. It's important that the snippet **starts with** `javscript:`.

```javascript
javascript:(function(){var s=document.createElement("script");s.onload=function(){new permon.Permon()},s.src="//tsopeh.github.io/permon/dist/permon.iife.js",document.head.appendChild(s)})();
```

> **Note**
> * Some browsers automatically remove the starting `javscript:` text, on paste, as a security measure. In such cases, you have to write it by hand;
> 
> * Unfortunately, Safari does not support Bookmarklets since iOS 15.

## Configuration and usage

### Defaults

By default, Permon will display three panels (FPS, Frame Latency (MS = milliseconds) and JS Heap Memory (MB = megabytes)) and update each panel once every 250 ms.

```typescript
import { Permon } from 'permon'

new Permon()
```

### Metrics

You can explicitly state which metrics you want to keep the track of. For example, if you're only interested in FPS, you can do the following.

```typescript
import { Permon } from 'permon'

new Permon({
  metrics: {
    fps: {
      calculator: Permon.UTILS.metrics.fps.createCalculator(),
      panel: Permon.UTILS.metrics.fps.createPanel(),
    },
  },
})
```

You can also define your own metrics. 

A _metric_ is made of two parts, the "calculator" function that produces stats, and the (**optional**) "panel" UI.

The "calculator" function is a simple function that will receive a new timestamp on each [animation frame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). You can use these timestamps to help you calculate whatever stats you want. 

The "Panel" is an object that contains:
    * a DOM element that will be appended next to other panels;
    * an `updateDom` function, that receives the stats produced by the _calculator_, and updates the DOM element to display the stats.

The three default metrics that Permon offers, all produce the stats that follow the `BasicStats` interface (see below).

```typescript
// Stats that we want to callculate.
interface BasicStats {
  current: number
  mean: number
  lowest: number
  highest: number
}

const calculator = (timestamp: number): BasicStats => {
  /*
   * Calculate stats.
   */
  return stats
}

const panel = {
  dom: domElement,
  updateDom: (stats: BasicStats) => {
    /*
    * Display stats in the `domElement`.
    */
  },
}

// Usage.

import { Permon } from 'permon'

new Permon({
  metrics: {
    ...Permon.UTILS.metrics.createAllDefaultMetrics(), // This will create all the default metrics.
    myCustomMetric: {
      calculator: calculator,
      panel: panel,
    },
  },
})
```

One simple example of capturing additional data is determining the client's time when the other stats were recorded. For this we will ignore the time stamp, since it's not needed for the calculation, and we can assume that UI is not needed. 

```typescript
import { Permon } from 'permon'

new Permon({
  metrics: {
    ...Permon.UTILS.metrics.createAllDefaultMetrics(), // This will create all the default metrics.
    clientTime: {
      calculator: () => (new Date).toISOString(),
    },
  },
})
```

### Access the data

Permon can periodically publish the collected statistics for all defined metrics. You can access this data by using the `onPublishStats` callback; and define the delay between two publishing events.

```typescript
new Permon({
  onPublishStats: (stats) => {
    console.table(stats)
  },
  minDelayMsBetweenPublishingStats: 1000, // Once per second, by default. Setting this option to `0` can be interpreted as "As fast as possible".
})
```

You can use this mechanism in combination with `headless` option, to periodically collect and send performance stats to some data aggregation service. This data can be later processed and help you determine how does your app actually behave on clients devices.

```typescript
new Permon({
  onPublishStats: (stats) => {
    fetch('https://some-data-aggregator-service...', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
    })
  },
  minDelayMsBetweenPublishingStats: 60 * 1000, // Once every minut.
  headless: true, // Do not render any panels
})
```

## Q&A

**This tool appears to be similar to others. What does this one bring to the table?**

Permon, and its UI panels were inspired by [stats.js](https://github.com/mrdoob/stats.js/) and [gamestats](https://github.com/ErikSom/gamestats). The difference is that Permon is opinionated on how and when it measures performance — while it stays open for extension. You can create your own metrics and/or panels. You can access the stats and handle them however you wish. It's written in Typescript, which provides better development experience for developers and maintainers.

**Why is there a brief delay before `FPS` and `Frame Latency` panels show any data?**

This is intentional behaviour. After the page loads, or when the monitored page becomes visible, Permon will give the page some time to stabilize before calculating metrics. Thus, reducing the chance of getting wild spikes for FPS and Frame Latency metrics.

**Why doesn't Permon monitor and publish stats when monitored page gets minimized, or when the another browser tab gets focused in the same app window?**

Permon relies on `requestAnimationFrame` callback to determine if a frame will be rendered, and to determine when it's a good time to do metrics calculation. This way it minimizes the performance overhead that's cauesd by monitoring. On the other hand, in order to save resources, the browsers have implemented an optimization, where the `requestAnimationFrame` doesn't get called for the pages (tabs) that are not visible (minimized, or when another tab is in the focus on the same application window). Because of this, when a monitored page becomes invisible, Permon gets effectively suspended, until it becomes visible again.
