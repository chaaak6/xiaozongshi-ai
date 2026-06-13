import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { type StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { expose } from '../middleware/expose';
import { flattenActions } from '../utils/flattenActions';
import { type AIProviderStoreState } from './initialState';
import { initialState } from './initialState';
import { type AiModelAction } from './slices/aiModel';
import { createAiModelSlice } from './slices/aiModel';
import { type AiProviderAction } from './slices/aiProvider';
import { createAiProviderSlice } from './slices/aiProvider';
import { type PermissionAction } from './slices/permission';
import { createPermissionSlice } from './slices/permission';

//  ===============  Aggregate createStoreFn ============ //

export interface AiInfraStore extends AIProviderStoreState, AiProviderAction, AiModelAction, PermissionAction {
  /* empty */
}

type AiInfraStoreAction = AiProviderAction & AiModelAction & PermissionAction;

const createStore: StateCreator<AiInfraStore, [['zustand/devtools', never]]> = (
  ...parameters: Parameters<StateCreator<AiInfraStore, [['zustand/devtools', never]]>>
) => ({
  ...initialState,
  ...flattenActions<AiInfraStoreAction>([
    createAiModelSlice(...parameters),
    createAiProviderSlice(...parameters),
    createPermissionSlice(...parameters),
  ]),
});

//  ===============  Implement useStore ============ //
const devtools = createDevtools('aiInfra');

export const useAiInfraStore = createWithEqualityFn<AiInfraStore>()(devtools(createStore), shallow);

expose('aiInfra', useAiInfraStore);

export const getAiInfraStoreState = () => useAiInfraStore.getState();
