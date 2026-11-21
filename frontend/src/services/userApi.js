import { apiRequest } from './api.js'

const FRONTEND_ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
}

const BACKEND_ROLES = Object.fromEntries(
  Object.entries(FRONTEND_ROLES).map(([backendRole, frontendRole]) => [frontendRole, backendRole]),
)

export const USER_ROLES = Object.values(FRONTEND_ROLES)

function mapUser(user) {
  const role = FRONTEND_ROLES[user?.role]
  if (
    !user ||
    user.id == null ||
    typeof user.name !== 'string' ||
    typeof user.email !== 'string' ||
    typeof user.phone !== 'string' ||
    !role ||
    typeof user.active !== 'boolean'
  ) {
    throw new Error('La API devolvió un usuario con datos inválidos.')
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

function mapRole(role) {
  const backendRole = BACKEND_ROLES[role]
  if (!backendRole) throw new Error('El rol seleccionado no es válido.')
  return backendRole
}

export async function fetchManagedUsers() {
  const response = await apiRequest('/api/admin')
  if (!Array.isArray(response)) throw new Error('La API devolvió una lista de usuarios inválida.')
  return response.map(mapUser)
}

export async function createManagedUser(user) {
  const response = await apiRequest('/api/admin', {
    method: 'POST',
    body: {
      name: user.name.trim(),
      phone: user.phone.trim(),
      email: user.email.trim(),
      password: user.password,
      role: mapRole(user.role),
    },
  })
  return mapUser(response)
}

export async function updateManagedUser(userId, user) {
  if (typeof user.active !== 'boolean') {
    throw new Error('Debes indicar si el usuario está activo.')
  }
  const response = await apiRequest(`/api/admin/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: {
      name: user.name.trim(),
      phone: user.phone.trim(),
      email: user.email.trim(),
      role: mapRole(user.role),
      active: user.active,
    },
  })
  return mapUser(response)
}
