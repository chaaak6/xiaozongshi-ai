/**
 * Admin management module mocks
 */
import { adminMockData } from './data';
import { createAdminHandlers } from './handlers';

/** Pre-constructed mock handlers for MockManager registration */
export const adminMocks = createAdminHandlers(adminMockData);

export { createAdminHandlers } from './handlers';
export * from './data';
export * from './types';
