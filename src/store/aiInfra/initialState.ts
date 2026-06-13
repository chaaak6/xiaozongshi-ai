import { type AIModelsState } from './slices/aiModel';
import { initialAIModelState } from './slices/aiModel';
import { type AIProviderState } from './slices/aiProvider';
import { initialAIProviderState } from './slices/aiProvider';
import { type PermissionState } from './slices/permission';
import { initialPermissionState } from './slices/permission';

export interface AIProviderStoreState extends AIProviderState, AIModelsState, PermissionState {
  /* empty */
}

export const initialState: AIProviderStoreState = {
  ...initialAIProviderState,
  ...initialAIModelState,
  ...initialPermissionState,
};
