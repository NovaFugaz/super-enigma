import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { getProductByCode } from '../data/catalog.js'
import { CART_STORAGE_KEY, calcTotals, loadCart, saveCart } from '../utils/cart.js'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [cart, setCart] = useState(loadCart)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        saveCart(cart)
    }, [cart])

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === CART_STORAGE_KEY || e.key === null) setCart(loadCart())
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    const lines = useMemo(
        () =>
            cart.items.flatMap(({ codigo, qty }) => {
                const product = getProductByCode(codigo)
                if (!product || product.stock === 0) return []
                return [{ product, qty: Math.min(qty, product.stock) }]
            }),
        [cart.items],
    )

    const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines])
    const totals = useMemo(() => calcTotals(lines, cart.shipping), [lines, cart.shipping])

    const addItem = useCallback(
        (product, qty = 1) => {
            const current = cart.items.find((i) => i.codigo === product.codigo)?.qty ?? 0
            const next = Math.min(current + qty, product.stock)
            if (next <= current) return 0

            setCart((prev) => {
                const inCart = prev.items.find((i) => i.codigo === product.codigo)
                const target = Math.min((inCart?.qty ?? 0) + qty, product.stock)
                const items = inCart
                    ? prev.items.map((i) => (i.codigo === product.codigo ? { ...i, qty: target } : i))
                    : [...prev.items, { codigo: product.codigo, qty: target }]
                return { ...prev, items }
            })
            return next - current
        },
        [cart.items],
    )

    const setQuantity = useCallback((codigo, qty) => {
        const product = getProductByCode(codigo)
        setCart((prev) => {
            if (!product || qty < 1) {
                return { ...prev, items: prev.items.filter((i) => i.codigo !== codigo) }
            }
            const target = Math.min(qty, product.stock)
            return {
                ...prev,
                items: prev.items.map((i) => (i.codigo === codigo ? { ...i, qty: target } : i)),
            }
        })
    }, [])

    const removeItem = useCallback((codigo) => {
        setCart((prev) => ({ ...prev, items: prev.items.filter((i) => i.codigo !== codigo) }))
    }, [])

    const clearCart = useCallback(() => {
        setCart((prev) => ({ ...prev, items: [] }))
    }, [])

    const setShipping = useCallback((shipping) => setCart((prev) => ({ ...prev, shipping })), [])
    const setPickupId = useCallback((pickupId) => setCart((prev) => ({ ...prev, pickupId })), [])

    const openCart = useCallback(() => setIsOpen(true), [])
    const closeCart = useCallback(() => setIsOpen(false), [])

    const value = {
        lines,
        count,
        totals,
        shipping: cart.shipping,
        pickupId: cart.pickupId,
        isOpen,
        openCart,
        closeCart,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
        setShipping,
        setPickupId,
    }

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}