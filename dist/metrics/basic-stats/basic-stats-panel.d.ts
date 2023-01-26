import { BasicStats, Panel } from '../types';
export interface PanelConfig {
    title: string;
    valueFormatter?: (value: number) => string;
    delayBetweenDomUpdatesMs?: number;
    backgroundColor?: string;
    foregroundColor?: string;
}
export interface PanelConfig_Normalized {
    title: string;
    valueFormatter: (value: number) => string;
    delayBetweenDomUpdatesMs: number;
    backgroundColor: string;
    foregroundColor: string;
}
export declare type BasicStatsPanel = Panel<BasicStats | null>;
export declare const createBasicStatsPanel: (_config: PanelConfig) => BasicStatsPanel;
