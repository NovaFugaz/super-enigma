import { webcrypto } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  window.localStorage.clear()
  Object.defineProperty(window, 'crypto', { configurable: true, value: webcrypto })
})

describe('mock auth service', () => {
  it('seeds a demo account for each role', async () => {
    const { seedDemoAccounts } = await import('../services/mockAuth.js')
    await seedDemoAccounts()
    const users = JSON.parse(window.localStorage.getItem('sonido-vivo-users'))

    expect(users.map((user) => user.role).sort()).toEqual(['admin', 'customer', 'seller'])
  })

  it('does not duplicate seeded accounts', async () => {
    const { seedDemoAccounts } = await import('../services/mockAuth.js')
    await seedDemoAccounts()
    await seedDemoAccounts()

    expect(JSON.parse(window.localStorage.getItem('sonido-vivo-users'))).toHaveLength(3)
  })

  it('authenticates a demo seller with the correct password', async () => {
    const { authenticateAccount, seedDemoAccounts } = await import('../services/mockAuth.js')
    await seedDemoAccounts()

    await expect(authenticateAccount('vendedor@sonidovivo.cl', 'Vendedor123!')).resolves.toMatchObject({
      role: 'seller',
      email: 'vendedor@sonidovivo.cl',
    })
  })

  it('rejects an incorrect password', async () => {
    const { authenticateAccount, seedDemoAccounts } = await import('../services/mockAuth.js')
    await seedDemoAccounts()

    await expect(authenticateAccount('admin@sonidovivo.cl', 'wrong-password')).resolves.toBeNull()
  })

  it('stores registered accounts as customers without plaintext passwords', async () => {
    const { registerAccount } = await import('../services/mockAuth.js')
    const result = await registerAccount({
      name: 'New Customer',
      phone: '+56 9 1234 5678',
      email: 'new@example.cl',
      password: 'Customer123!',
    })
    const savedUser = JSON.parse(window.localStorage.getItem('sonido-vivo-users'))[0]

    expect(result.profile.role).toBe('customer')
    expect(savedUser.password).toBeUndefined()
    expect(savedUser.passwordHash).toBeTruthy()
  })

  it('rejects registering an existing email case-insensitively', async () => {
    const { registerAccount } = await import('../services/mockAuth.js')
    const account = {
      name: 'First Customer',
      phone: '+56 9 1234 5678',
      email: 'person@example.cl',
      password: 'Customer123!',
    }
    await registerAccount(account)
    const duplicate = await registerAccount({ ...account, email: 'PERSON@example.cl' })

    expect(duplicate.error).toMatch(/Ya existe una cuenta/)
  })

  it('replaces a password and rejects the old one', async () => {
    const { authenticateAccount, registerAccount, resetAccountPassword } = await import('../services/mockAuth.js')
    await registerAccount({
      name: 'Reset Customer',
      phone: '+56 9 1234 5678',
      email: 'reset@example.cl',
      password: 'OldPass123!',
    })
    await expect(resetAccountPassword('reset@example.cl', 'NewPass123!')).resolves.toBe(true)

    await expect(authenticateAccount('reset@example.cl', 'OldPass123!')).resolves.toBeNull()
    await expect(authenticateAccount('reset@example.cl', 'NewPass123!')).resolves.toMatchObject({
      email: 'reset@example.cl',
    })
  })

  it('detects existing accounts case-insensitively and exposes managed users', async () => {
    const { accountExists, createManagedUser, listManagedUsers, registerAccount } = await import('../services/mockAuth.js')

    await registerAccount({
      name: 'Case User',
      phone: '+56 9 5555 6666',
      email: 'case@demo.cl',
      password: 'Case123!',
    })

    expect(accountExists('CASE@DEMO.CL')).toBe(true)

    await createManagedUser({
      name: 'Seller QA',
      email: 'seller.qa@example.cl',
      password: 'Seller123!',
      role: 'seller',
    })

    expect(listManagedUsers().some((user) => user.email === 'seller.qa@example.cl')).toBe(true)
    expect(listManagedUsers().some((user) => user.email === 'case@demo.cl')).toBe(true)
  })

  it('rejects authentication for inactive users', async () => {
    const { authenticateAccount, createManagedUser } = await import('../services/mockAuth.js')

    const created = await createManagedUser({
      name: 'Inactive User',
      email: 'inactive@example.cl',
      password: 'Inactive123!',
      role: 'customer',
    })

    const { updateManagedUser } = await import('../services/mockAuth.js')
    updateManagedUser(created.user.id, { active: false })

    await expect(authenticateAccount('inactive@example.cl', 'Inactive123!')).resolves.toBeNull()
  })
})