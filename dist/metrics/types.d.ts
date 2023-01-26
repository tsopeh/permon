export declare type MetricCalculator<TStats> = (t: number) => TStats;
export declare type Panel<TStats> = {
    dom: HTMLElement;
    updateDom: (stats: TStats) => void;
};
export declare type CalculatorAndPanel<TStats> = {
    calculator: MetricCalculator<TStats>;
    panel?: Panel<TStats>;
};
export declare type MonitoredMetrics = Record<string, CalculatorAndPanel<any>>;
export declare type UnwrapMonitoredMetrics<T extends MonitoredMetrics> = {
    [K in keyof T]: (T[K] extends CalculatorAndPanel<infer U> ? U : never);
};
export interface BasicStats {
    current: number;
    mean: number;
    lowest: number;
    highest: number;
}
