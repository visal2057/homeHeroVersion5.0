export const ROLES = {
  CLIENT: 'CLIENT',
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  VERIFICATION_ADMIN: 'VERIFICATION_ADMIN',
};

export const ROLE_HOME_ROUTE = {
  [ROLES.CLIENT]: '/',
  [ROLES.SERVICE_PROVIDER]: '/provider/dashboard',
  [ROLES.SYSTEM_ADMIN]: '/admin/system/dashboard',
  [ROLES.VERIFICATION_ADMIN]: '/admin/verification/dashboard',
};
