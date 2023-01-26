import { BasicStats, MetricCalculator } from '../types';
/**
 * More info on memory estimation: https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory
 */
export declare const createMemoryCalculator: () => MetricCalculator<BasicStats | null>;
