import { authorizeRoles } from './authorizeRoles.js';

export const requireProvider = authorizeRoles('SERVICE_PROVIDER');
