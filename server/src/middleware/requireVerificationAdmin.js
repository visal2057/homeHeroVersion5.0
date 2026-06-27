import { authorizeRoles } from './authorizeRoles.js';

export const requireVerificationAdmin = authorizeRoles('VERIFICATION_ADMIN');
