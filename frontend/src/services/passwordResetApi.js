import { apiRequest } from './api.js'

export function requestPasswordReset(email) {
  return apiRequest('/api/auth/password-reset/request', {
    method: 'POST',
    body: { email },
  })
}

export function confirmPasswordReset(token, newPassword) {
  return apiRequest('/api/auth/password-reset/confirm', {
    method: 'POST',
    body: { token, newPassword },
  })
}
