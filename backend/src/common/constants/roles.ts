export const ROLE_ADMIN = 'admin';
export const ROLE_STAFF = 'staff';
export const ROLE_CUSTOMER = 'customer';

export const SYSTEM_ROLES = [
  {
    name: ROLE_ADMIN,
    description: 'Acceso completo al panel administrativo de NEXALAB',
  },
  {
    name: ROLE_STAFF,
    description: 'Personal operativo con acceso limitado al panel',
  },
  {
    name: ROLE_CUSTOMER,
    description: 'Cliente de la plataforma NEXALAB',
  },
] as const;
