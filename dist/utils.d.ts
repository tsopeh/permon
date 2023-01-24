export declare const onDocumentVisibilityChange: (callback: (isDocumentVisible: boolean) => void) => boolean;
export declare const roundDecimal: (decimalPlaces: number) => (x: number) => number;
export declare const roundToInt: (x: number) => number;
export declare const integerFormatter: (x: number) => string;
export declare const roundToTwoDecimalPlaces: (x: number) => number;
export declare const roundToTwoDecimalPlacesFormatter: (x: number) => string;
export declare const UTILS: {
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
        createAllDefaultMetrics: () => import("./metrics").MonitoredMetrics;
    };
    formatters: {
        roundDecimal: (decimalPlaces: number) => (x: number) => number;
        integerFormatter: (x: number) => string;
        roundToTwoDecimalPlacesFormatter: (x: number) => string;
    };
    onDocumentVisibilityChange: (callback: (isDocumentVisible: boolean) => void) => boolean;
};