var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const normalizeConfig$1 = (input) => {
  return {
    title: (input == null ? void 0 : input.title) ?? "N/A",
    valueFormatter: (input == null ? void 0 : input.valueFormatter) ?? ((value) => value.toString()),
    delayBetweenDomUpdatesMs: (input == null ? void 0 : input.delayBetweenDomUpdatesMs) ?? 250,
    backgroundColor: (input == null ? void 0 : input.backgroundColor) ?? "#0000ff",
    foregroundColor: (input == null ? void 0 : input.foregroundColor) ?? "#00ff00"
  };
};
const createBasicStatsPanel = (_config) => {
  const { title, valueFormatter, delayBetweenDomUpdatesMs, backgroundColor, foregroundColor } = normalizeConfig$1(_config);
  const pixelRatio = Math.ceil(1 / (window.devicePixelRatio ?? 1));
  const upscaleFactor = pixelRatio + 2;
  const _rawCanvasWidth = 120;
  const _rawCanvasHeight = 60;
  const canvasWidth = upscaleFactor * _rawCanvasWidth;
  const canvasHeight = upscaleFactor * _rawCanvasHeight;
  const textX = upscaleFactor * 3;
  const textY = upscaleFactor * 3;
  const fontSize = upscaleFactor * 10;
  const graphX = upscaleFactor * 3;
  const graphY = 2 * textY + fontSize;
  const graphWidth = canvasWidth - 2 * graphX;
  const graphHeight = canvasHeight - graphY - textY;
  const graphLineThickness = upscaleFactor * 1;
  const graphLinesSpacing = upscaleFactor;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = pixelRatio * _rawCanvasWidth + "px";
  canvas.style.height = pixelRatio * _rawCanvasHeight + "px";
  const context = canvas.getContext("2d");
  if (context == null) {
    throw new Error("Canvas context not found.");
  }
  context.font = "bold " + fontSize + "px monospace";
  context.textBaseline = "top";
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = foregroundColor;
  context.fillText(title, textX, textY);
  context.fillRect(graphX, graphY, graphWidth, graphHeight);
  context.fillStyle = backgroundColor;
  context.globalAlpha = 0.9;
  context.fillRect(graphX, graphY, graphWidth, graphHeight);
  let _tLatestUpdate = -Infinity;
  return {
    dom: canvas,
    updateDom: (stats) => {
      const t = performance.now();
      if (stats == null || _tLatestUpdate + delayBetweenDomUpdatesMs > t) {
        return;
      } else {
        _tLatestUpdate = t;
      }
      const { current: value, lowest: min, highest: max } = stats;
      context.fillStyle = backgroundColor;
      context.globalAlpha = 1;
      context.fillRect(0, 0, canvasWidth, graphY);
      context.fillStyle = foregroundColor;
      context.fillText(`${title} (${valueFormatter(min)}–${valueFormatter(max)}) ${valueFormatter(value)}`, textX, textY);
      context.drawImage(canvas, graphX + graphLinesSpacing, graphY, graphWidth - graphLinesSpacing, graphHeight, graphX, graphY, graphWidth - graphLinesSpacing, graphHeight);
      context.fillRect(graphX + graphWidth - graphLineThickness, graphY, graphLineThickness, graphHeight);
      context.fillStyle = backgroundColor;
      context.globalAlpha = 0.9;
      context.fillRect(graphX + graphWidth - graphLineThickness, graphY, graphLineThickness, roundToInt((1 - value / max) * graphHeight));
    }
  };
};
const createFpsCalculator = () => {
  let _isStable = false;
  const _sampleWindow = [];
  let _lowest = Infinity;
  let _highest = 0;
  let _count = 0;
  let _mean = 0;
  let isDocumentVisible = onDocumentVisibilityChange((isVisible) => {
    isDocumentVisible = isVisible;
    _isStable = false;
    _sampleWindow.length = 0;
  });
  const metric = (t) => {
    if (!isDocumentVisible) {
      return null;
    }
    _sampleWindow.push(t);
    let elapsedFromOldest = t - _sampleWindow[0];
    if (!_isStable) {
      if (elapsedFromOldest >= 1900) {
        _isStable = true;
      } else {
        return null;
      }
    }
    while (elapsedFromOldest >= 1e3) {
      _sampleWindow.shift();
      elapsedFromOldest = t - _sampleWindow[0];
    }
    const currFps = _sampleWindow.length;
    _count++;
    _mean = _mean * (_count - 1) / _count + currFps / _count;
    _lowest = Math.min(_lowest, currFps);
    _highest = Math.max(_highest, currFps);
    return {
      current: currFps,
      mean: _mean,
      lowest: _lowest,
      highest: _highest
    };
  };
  return metric;
};
const createFrameLatencyCalculator = () => {
  let _isStable = false;
  let _tFirstVisible = Infinity;
  let _tPrev = Infinity;
  let _tCurr = Infinity;
  let _lowest = Infinity;
  let _highest = -Infinity;
  let _count = 0;
  let _mean = 0;
  let isDocumentVisible = onDocumentVisibilityChange((isVisible) => {
    isDocumentVisible = isVisible;
    _isStable = false;
    _tFirstVisible = Infinity;
    _tPrev = Infinity;
    _tCurr = Infinity;
  });
  const metric = (t) => {
    if (!isDocumentVisible) {
      return null;
    }
    _tPrev = _tCurr;
    _tCurr = t;
    if (!_isStable) {
      _tFirstVisible = Math.min(_tFirstVisible, t);
      if (t - _tFirstVisible >= 1900) {
        _isStable = true;
      } else {
        return null;
      }
    }
    const currLatency = _tCurr - _tPrev;
    if (currLatency < _lowest) {
      _lowest = currLatency;
    }
    if (currLatency > _highest) {
      _highest = currLatency;
    }
    _count++;
    _mean = _mean * (_count - 1) / _count + currLatency / _count;
    return {
      current: currLatency,
      mean: _mean,
      lowest: _lowest,
      highest: _highest
    };
  };
  return metric;
};
const createMemoryCalculator = () => {
  let _lowest = Infinity;
  let _highest = 0;
  let _count = 0;
  let _mean = 0;
  const metric = () => {
    try {
      const memory2 = performance.memory;
      const currMem = memory2.usedJSHeapSize;
      _count++;
      _mean = _mean * (_count - 1) / _count + currMem / _count;
      _lowest = Math.min(_lowest, currMem);
      _highest = Math.max(_highest, currMem);
      return {
        current: currMem,
        mean: _mean,
        highest: _highest,
        lowest: _lowest
      };
    } catch (error) {
    }
    return null;
  };
  return metric;
};
const fps = {
  createCalculator: createFpsCalculator,
  createPanel: () => {
    return createBasicStatsPanel({
      title: "FPS",
      valueFormatter: integerFormatter,
      backgroundColor: "#181d37",
      foregroundColor: "#6ef8fc"
    });
  }
};
const frameLatency = {
  createCalculator: createFrameLatencyCalculator,
  createPanel: () => {
    return createBasicStatsPanel({
      title: "MS",
      valueFormatter: integerFormatter,
      backgroundColor: "#22361a",
      foregroundColor: "#78f123"
    });
  }
};
const memory = {
  createCalculator: createMemoryCalculator,
  createPanel: () => {
    return createBasicStatsPanel({
      title: "MB",
      valueFormatter: (value) => roundToInt(value * 1e-6).toString(),
      backgroundColor: "#341e2a",
      foregroundColor: "#ec5499"
    });
  }
};
const metricsUtils = {
  fps,
  frameLatency,
  memory,
  createAllDefaultMetrics: () => {
    return {
      fps: { calculator: fps.createCalculator(), panel: fps.createPanel() },
      frameLatency: { calculator: frameLatency.createCalculator(), panel: frameLatency.createPanel() },
      memory: { calculator: memory.createCalculator(), panel: memory.createPanel() }
    };
  }
};
const onDocumentVisibilityChange = (callback) => {
  document.addEventListener("visibilitychange", () => {
    callback(!document.hidden);
  });
  return !document.hidden;
};
const roundDecimal = (decimalPlaces) => (x) => {
  const decimalDivider = Math.pow(10, decimalPlaces);
  return Math.round((x * decimalDivider + Number.EPSILON) / decimalDivider);
};
const roundToInt = roundDecimal(0);
const integerFormatter = (x) => roundToInt(x).toString();
const roundToTwoDecimalPlaces = roundDecimal(2);
const roundToTwoDecimalPlacesFormatter = (x) => roundToTwoDecimalPlaces(x).toString();
const UTILS = {
  permonVersion: "v1.1.2",
  metrics: metricsUtils,
  formatters: {
    roundDecimal,
    integerFormatter,
    roundToTwoDecimalPlacesFormatter
  },
  onDocumentVisibilityChange
};
const normalizeConfig = (input) => {
  return {
    metrics: (input == null ? void 0 : input.metrics) == null ? UTILS.metrics.createAllDefaultMetrics() : Object.entries(input.metrics).reduce((acc, [key, rawMetric]) => {
      return {
        ...acc,
        [key]: { panel: rawMetric.panel, calculator: rawMetric.calculator }
      };
    }, {}),
    headless: (input == null ? void 0 : input.headless) ?? false,
    styleAndAppendDomContainer: (input == null ? void 0 : input.styleAndAppendDomContainer) ?? ((container) => {
      container.style.cssText = "z-index:5100;display:flex;gap:4px;position:fixed;top:4px;left:4px;opacity:0.9;pointer-events:none;";
      document.body.appendChild(container);
    }),
    onPublishStats: (input == null ? void 0 : input.onPublishStats) ?? (() => {
    }),
    minDelayMsBetweenPublishingStats: Math.max(0, (input == null ? void 0 : input.minDelayMsBetweenPublishingStats) ?? 1e3),
    skipGreeting: (input == null ? void 0 : input.skipGreeting) ?? false
  };
};
class Permon {
  constructor(_config) {
    __publicField(this, "rafId", null);
    __publicField(this, "domContainer", null);
    const config = normalizeConfig(_config);
    if (!config.headless) {
      const container = document.createElement("div");
      for (const [_, { panel }] of Object.entries(config.metrics)) {
        if ((panel == null ? void 0 : panel.dom) != null) {
          container.appendChild(panel.dom);
        }
      }
      config.styleAndAppendDomContainer(container);
    }
    let tLatestPublish = -Infinity;
    const onAnimationFrame = () => {
      const t = performance.now();
      const stats = {};
      for (const [key, { calculator, panel }] of Object.entries(config.metrics)) {
        const value = calculator(t);
        stats[key] = value;
        if (!config.headless && panel != null) {
          panel.updateDom(value);
        }
      }
      if (tLatestPublish + config.minDelayMsBetweenPublishingStats <= t) {
        config.onPublishStats(stats);
        tLatestPublish = t;
      }
      this.rafId = requestAnimationFrame(onAnimationFrame);
    };
    this.rafId = requestAnimationFrame(onAnimationFrame);
    if (!config.skipGreeting) {
      console.log(`Permon (${UTILS.permonVersion}) has started monitoring the page performance.`);
    }
  }
  destroy() {
    var _a;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = null;
    (_a = this.domContainer) == null ? void 0 : _a.remove();
  }
}
__publicField(Permon, "UTILS", UTILS);
export {
  Permon
};
//# sourceMappingURL=permon.js.map
