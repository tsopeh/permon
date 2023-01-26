import { MonitoredMetrics, UnwrapMonitoredMetrics } from './metrics';
export interface PermonConfig<T extends MonitoredMetrics> {
    metrics?: T;
    headless?: boolean;
    styleAndAppendDomContainer?: (container: HTMLDivElement) => void;
    onPublishStats?: (stats: UnwrapMonitoredMetrics<T>) => void;
    minDelayMsBetweenPublishingStats?: number;
    skipGreeting?: boolean;
}
export declare class Permon<T extends MonitoredMetrics> {
    private rafId;
    private domContainer;
    static readonly UTILS: {
        permonVersion: any;
        metrics: {
            fps: {
                createCalculator: () => import("./metrics").MetricCalculator<import("./metrics").BasicStats | null>;
                createPanel: () => import("./metrics").BasicStatsPanel;
            };
            frameLatency: {
                createCalculator: () => import("./metrics").MetricCalculator<import("./metrics").BasicStats | null>;
                createPanel: () => import("./metrics").BasicStatsPanel;
            };
            memory: {
                createCalculator: () => import("./metrics").MetricCalculator<import("./metrics").BasicStats | null>;
                createPanel: () => import("./metrics").BasicStatsPanel;
            };
            createAllDefaultMetrics: () => MonitoredMetrics;
            createBasicStatsPanel: (_config: import("./metrics").PanelConfig) => import("./metrics").BasicStatsPanel;
        };
        formatters: {
            roundDecimal: (decimalPlaces: number) => (x: number) => number;
            integerFormatter: (x: number) => string;
            roundToTwoDecimalPlacesFormatter: (x: number) => string;
        };
        onDocumentVisibilityChange: (callback: (isDocumentVisible: boolean) => void) => boolean;
    };
    constructor(_config?: PermonConfig<T>);
    destroy(): void;
}
