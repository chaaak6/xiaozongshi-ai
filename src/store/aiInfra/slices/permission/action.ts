import { type AiInfraStore } from '@/store/aiInfra/store';
import { type StoreSetter } from '@/store/types';

type Setter = StoreSetter<AiInfraStore>;

export const createPermissionSlice = (set: Setter, _get: () => AiInfraStore, _api?: unknown) =>
  new PermissionActionImpl(set);

export class PermissionActionImpl {
  readonly #set: Setter;

  constructor(set: Setter) {
    this.#set = set;
  }

  setUserPermissions = (permissions: string[]): void => {
    this.#set({ userPermissions: permissions }, false, 'setUserPermissions');
  };
}

export type PermissionAction = Pick<PermissionActionImpl, keyof PermissionActionImpl>;
