import { authorizeRoles } from './authorizeRoles.js';

export const requireSystemAdmin = authorizeRoles('SYSTEM_ADMIN');
