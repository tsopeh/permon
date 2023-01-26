import { MonitoredMetrics } from './types';
export declare const metricsUtils: {
    fps: {
        createCalculator: () => import("./types").MetricCalculator<import("./types").BasicStats | null>;
        createPanel: () => import("./basic-stats/basic-stats-panel").BasicStatsPanel;
    };
    frameLatency: {
        createCalculator: () => import("./types").MetricCalculator<import("./types").BasicStats | null>;
        createPanel: () => import("./basic-stats/basic-stats-panel").BasicStatsPanel;
    };
    memory: {
        createCalculator: () => import("./types").MetricCalculator<import("./types").BasicStats | null>;
        createPanel: () => import("./basic-stats/basic-stats-panel").BasicStatsPanel;
    };
    createAllDefaultMetrics: () => MonitoredMetrics;
    createBasicStatsPanel: (_config: import("./basic-stats/basic-stats-panel").PanelConfig) => import("./basic-stats/basic-stats-panel").BasicStatsPanel;
};
