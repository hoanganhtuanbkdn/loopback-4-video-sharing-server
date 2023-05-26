import {basicAuthorization} from '../services/basic.authorizor';

export const USER_ROLE_ADMIN = 'admin';
export const USER_ROLE_MODERATOR = 'customer';

const CUSTOMER_ROLES = [USER_ROLE_MODERATOR, USER_ROLE_ADMIN];
const ADMIN_ROLES = [USER_ROLE_ADMIN];

export const AUTHORIZE_MOD = {
  allowedRoles: CUSTOMER_ROLES,
  voters: [basicAuthorization],
};

export const AUTHORIZE_ADMIN = {
  allowedRoles: ADMIN_ROLES,
  voters: [basicAuthorization],
};

export const SECRET_HEADER = 'jg-x-header';
export const SECRET_HEADER_VALUE = 'DsQ6rXMptNePOSceCj0ZoJgkQvMAFAiB';
