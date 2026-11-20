import { apiRequest } from './api.js'

const ROLE_MAP = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
}

function toProfile(user) {
  const role = ROLE_MAP[user?.role]
  if (!user || !role || user.id == null || typeof user.email !== 'string') {
    throw new Error('La API devolvió un perfil de usuario inválido.')
  }

  return {
    id: String(user.id),
    name: user.name,
    phone: user.phone,
    email: user.email,
    role,
    active: user.active,
  }
}

async function authenticate(path, payload) {
  const response = await apiRequest(path, { method: 'POST', body: payload })
  if (typeof response?.token !== 'string' || !response.token) {
    throw new Error('La API no devolvió un token de autenticación.')
  }

  return { profile: toProfile(response.user), token: response.token }
}

export function loginAccount(email, password) {
  return authenticate('/api/auth/login', { email, password })
}

export function registerAccount({ name, phone, email, password }) {
  return authenticate('/api/auth/register', { name, phone, email, password })
}
