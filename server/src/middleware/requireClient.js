import { authorizeRoles } from './authorizeRoles.js';

export const requireClient = authorizeRoles('CLIENT');
