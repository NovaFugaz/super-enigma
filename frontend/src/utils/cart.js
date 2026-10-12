// Lógica pura del carrito: persistencia y cálculo de totales.

export const CART_STORAGE_KEY = 'sonido-vivo:cart'

export const IVA_RATE = 0.19
export const PRICES_INCLUDE_IVA = true
export const HOME_SHIPPING_COST = 4990
export const FREE_SHIPPING_FROM = 150000

export const CHECKOUT_LOGIN_MESSAGE = 'Primero debes estar registrado para comprar.'

const EMPTY_CART = { items: [], shipping: 'domicilio', pickupId: null }

export function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY)
        if (!raw) return EMPTY_CART
        const data = JSON.parse(raw)

        const items = Array.isArray(data?.items)
            ? data.items.filter(
                (i) => typeof i?.codigo === 'string' && Number.isInteger(i?.qty) && i.qty > 0,
            )
            : []

        return {
            items,
            shipping: data?.shipping === 'retiro' ? 'retiro' : 'domicilio',
            pickupId: typeof data?.pickupId === 'string' ? data.pickupId : null,
        }
    } catch {
        return EMPTY_CART
    }
}

export function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {

    }
}


export function calcTotals(lines, shipping) {
    const subtotal = lines.reduce((sum, l) => sum + l.product.precio * l.qty, 0)

    const hasFreeShipping = FREE_SHIPPING_FROM !== null && subtotal >= FREE_SHIPPING_FROM
    const shippingCost =
        shipping === 'domicilio' && subtotal > 0 && !hasFreeShipping ? HOME_SHIPPING_COST : 0

    const missingForFreeShipping =
        shipping === 'domicilio' && subtotal > 0 && FREE_SHIPPING_FROM !== null && !hasFreeShipping
            ? FREE_SHIPPING_FROM - subtotal
            : 0

    const base = subtotal + shippingCost

    if (PRICES_INCLUDE_IVA) {
        const net = Math.round(base / (1 + IVA_RATE))
        return {
            subtotal,
            shippingCost,
            hasFreeShipping,
            missingForFreeShipping,
            iva: base - net,
            total: base,
            ivaIncluded: true,
        }
    }

    const iva = Math.round(base * IVA_RATE)
    return {
        subtotal,
        shippingCost,
        hasFreeShipping,
        missingForFreeShipping,
        iva,
        total: base + iva,
        ivaIncluded: false,
    }
}