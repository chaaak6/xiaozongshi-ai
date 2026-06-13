/**
 * Mock data for NewAPI model list
 */

export interface NewAPIModel {
  created: number;
  id: string;
  object: 'model';
  owned_by: string;
}

/**
 * Simulates the response from new-api `/v1/models` endpoint
 */
export const mockNewAPIModels: NewAPIModel[] = [
  { created: 1_700_000_000, id: 'gpt-4o', object: 'model', owned_by: 'openai' },
  { created: 1_700_000_000, id: 'gpt-4o-mini', object: 'model', owned_by: 'openai' },
  { created: 1_700_000_000, id: 'claude-3-haiku', object: 'model', owned_by: 'anthropic' },
  { created: 1_700_000_000, id: 'deepseek-chat', object: 'model', owned_by: 'deepseek' },
  { created: 1_700_000_000, id: 'gemini-2.0-flash', object: 'model', owned_by: 'google' },
];
