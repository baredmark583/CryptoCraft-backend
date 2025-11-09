export type AiScenario = 'text' | 'vision' | 'image-edit';
export type AiProviderName = 'gemini' | 'deepseek';
export interface AiUsageMetrics {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    cachedTokens?: number;
}
export interface AiProviderResult<T> {
    data: T;
    usage?: AiUsageMetrics;
}
export interface AiResponseMeta {
    scenario: AiScenario;
    provider: AiProviderName;
    latencyMs: number;
    usage?: AiUsageMetrics;
    warnings?: string[];
}
export interface AiResponse<T> {
    data: T;
    meta: AiResponseMeta;
}
