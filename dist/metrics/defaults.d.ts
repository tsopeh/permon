import { MonitoredMetrics } from './types';
export declare const metricsUtils: {
    fps: {
        createCalculator: () => import("./types").MetricCalculator<import("./basic-stats/basic-stats").BasicStats | null>;
        createPanel: () => import("./basic-stats/basic-stats").BasicStatsPanel;
    };
    frameLatency: {
        createCalculator: () => import("./types").MetricCalculator<import("./basic-stats/basic-stats").BasicStats | null>;
        createPanel: () => import("./basic-stats/basic-stats").BasicStatsPanel;
    };
    memory: {
        createCalculator: () => import("./types").MetricCalculator<import("./basic-stats/basic-stats").BasicStats | null>;
        createPanel: () => import("./basic-stats/basic-stats").BasicStatsPanel;
    };
    createAllDefaultMetrics: () => MonitoredMetrics;
};
