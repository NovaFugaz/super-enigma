export const LOCATIONS = [
  {
    id: 'tienda',
    type: 'store',
    name: 'Sonido Vivo - Tienda',
    address: 'Av. Valparaíso 581, Loc 17, Viña del Mar, Valparaíso',
    position: [-33.0241, -71.5543],
    hours: [
      'Lunes a Viernes: 10:30 - 19:30 hrs',
      'Sábados y Domingos: Cerrado',
    ],
    note: 'Ubicación de la tienda física.',
  },
  {
    id: 'retiro-centro',
    type: 'pickup',
    name: 'Starken Viña Batuco',
    address: 'Av. Valparaíso 1195, Viña del Mar, Valparaíso',
    position: [-33.0259, -71.5449],
    hours: [
      'Lunes a Viernes: 09:00 - 18:30 hrs',
      'Sábados: 09:00 - 13:00',
      'Domingo y festivos: Cerrado',
    ],
    note: 'Retiro de pedidos Starken',
  },
  {
    id: 'retiro-chile',
    type: 'pickup',
    name: 'Chilexpress Centro de Servicios',
    address: 'San Antonio 1218, Viña del Mar, Valparaíso',
    position: [-33.0110, -71.5426],
    hours: [
      'Lunes a Viernes: 09:00 - 18:00 hrs',
      'Sábados: 10:00 - 13:00',
      'Domingo y festivos: Cerrado',
    ],
    note: 'Retiro de pedidos Chilexpress',
  },
]

export const STORE = LOCATIONS[0]

export const googleDirectionsUrl = ([lat, lng]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`

export const wazeUrl = ([lat, lng]) =>
  `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`