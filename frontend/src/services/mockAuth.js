const USERS_KEY = 'sonido-vivo-users'
export const USER_ROLES = ['customer', 'seller', 'admin']

const DEMO_ACCOUNTS = [
  { name: 'Cliente Demo', phone: '+56 9 1111 1111', email: 'cliente@sonidovivo.cl', password: 'Cliente123!', role: 'customer' },
  { name: 'Vendedor Demo', phone: '+56 9 2222 2222', email: 'vendedor@sonidovivo.cl', password: 'Vendedor123!', role: 'seller' },
  { name: 'Administrador Demo', phone: '+56 9 3333 3333', email: 'admin@sonidovivo.cl', password: 'Admin123!', role: 'admin' },
]

let demoSeedPromise

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function readUsers() {
  try {
    const users = JSON.parse(window.localStorage.getItem(USERS_KEY) ?? '[]')
    return Array.isArray(users) ? users : []
  } catch {
    return []
  }
}

function writeUsers(users) {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
    return true
  } catch {
    return false
  }
}

function toProfile(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: USER_ROLES.includes(user.role) ? user.role : 'customer',
  }
}

function createSalt() {
  const bytes = window.crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password, salt) {
  const input = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await window.crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function seedDemoAccounts() {
  if (!demoSeedPromise) {
    demoSeedPromise = (async () => {
      const users = readUsers()
      const missingAccounts = DEMO_ACCOUNTS.filter(
        (demo) => !users.some((user) => user.email === demo.email),
      )

      if (missingAccounts.length === 0) return true

      try {
        const seededAccounts = await Promise.all(
          missingAccounts.map(async (demo) => {
            const salt = createSalt()
            const passwordHash = await hashPassword(demo.password, salt)
            return {
              id: `demo-${demo.role}`,
              name: demo.name,
              phone: demo.phone,
              email: demo.email,
              role: demo.role,
              salt,
              passwordHash,
            }
          }),
        )
        return writeUsers([...users, ...seededAccounts])
      } catch {
        return false
      }
    })()
  }

  return demoSeedPromise
}

export async function registerAccount({ name, phone, email, password }) {
  const users = readUsers()
  const normalizedEmail = normalizeEmail(email)

  if (users.some((user) => user.email === normalizedEmail)) {
    return { error: 'Ya existe una cuenta con ese correo.' }
  }

  let salt
  let passwordHash
  try {
    salt = createSalt()
    passwordHash = await hashPassword(password, salt)
  } catch {
    return { error: 'Este navegador no permite crear credenciales locales.' }
  }

  const user = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    email: normalizedEmail,
    role: 'customer',
    salt,
    passwordHash,
  }

  if (!writeUsers([...users, user])) {
    return { error: 'No se pudo guardar la cuenta en este navegador.' }
  }

  return { profile: toProfile(user) }
}

export async function authenticateAccount(email, password) {
  const normalizedEmail = normalizeEmail(email)
  const user = readUsers().find(
    (account) => account.email === normalizedEmail,
  )

  if (!user?.salt || !user.passwordHash) return null
  try {
    const passwordHash = await hashPassword(password, user.salt)
    return passwordHash === user.passwordHash ? toProfile(user) : null
  } catch {
    return null
  }
}

export function accountExists(email) {
  const normalizedEmail = normalizeEmail(email)
  return readUsers().some((user) => user.email === normalizedEmail)
}

export async function resetAccountPassword(email, password) {
  const normalizedEmail = normalizeEmail(email)
  const users = readUsers()
  const index = users.findIndex((user) => user.email === normalizedEmail)
  if (index < 0) return false

  let salt
  let passwordHash
  try {
    salt = createSalt()
    passwordHash = await hashPassword(password, salt)
  } catch {
    return false
  }

  const updatedUsers = users.map((user, userIndex) =>
    userIndex === index ? { ...user, salt, passwordHash } : user,
  )
  return writeUsers(updatedUsers)
}