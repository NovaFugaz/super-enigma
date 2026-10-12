export const CATEGORIES = [
  { slug: 'guitarras-acusticas', nombre: 'Guitarras Acústicas', descripcion: 'Folk, Dreadnought, Clásica, Electroacústica, Niños', image: '' }, 
  { slug: 'guitarras-electricas', nombre: 'Guitarras Eléctricas', descripcion: 'Stratocaster, Telecaster, Les Paul, SG, Semi-hollow, Signature', image: '' },
  { slug: 'bajos-electricos', nombre: 'Bajos Eléctricos', descripcion: 'Precision, Jazz, Activo, Acústico, Fretless', image: '' }, 
  { slug: 'baterias', nombre: 'Baterías', descripcion: 'Acústica, Electrónica, Cajas, Platillos, Stands', image: '' },
  { slug: 'teclados-pianos', nombre: 'Teclados y Pianos', descripcion: 'Digital, Sintetizador, MIDI Controller, Órgano', image: '' }, 
  { slug: 'amplificadores', nombre: 'Amplificadores', descripcion: 'Guitarra combo, Guitarra cabezal, Bajo, Acústico, Teclado', image: '' }, 
  { slug: 'microfonos', nombre: 'Micrófonos', descripcion: 'Dinámico, Condensador, USB, Ribbon, Lavalier', image: '' }, 
  { slug: 'pedales-de-efectos', nombre: 'Pedales de Efectos', descripcion: 'Distorsión, Overdrive, Fuzz, Reverb, Delay, Chorus, Multi-FX', image: '' }, 
  { slug: 'accesorios', nombre: 'Accesorios', descripcion: 'Cuerdas, Púas, Soportes, Cables, Correas, Afinadores', image: '' }, 
  { slug: 'estudio-grabacion', nombre: 'Estudio y Grabación', descripcion: 'Interfaces, Auriculares, Monitores, Pop filters, DAW', image: '' }, 
]

export const PRODUCTS = [
  // Guitarras Acústicas
  { codigo: 'GA001', categoria: 'guitarras-acusticas', nombre: 'Guitarra Acústica Folk', marca: 'Yamaha', modelo: 'F310', stock: 8, precio: 129990, descripcion: 'Tapa de abeto, aros y fondo de meranti. Ideal para iniciantes.', image: '' },
  { codigo: 'GA002', categoria: 'guitarras-acusticas', nombre: 'Guitarra Acústica Dreadnought', marca: 'Fender', modelo: 'CD-60S', stock: 5, precio: 189990, descripcion: 'Tapa de abeto macizo, brazo de caoba. Sonido cálido y proyectado.', image: '' },
  { codigo: 'GA003', categoria: 'guitarras-acusticas', nombre: 'Guitarra Acústica Clásica 4/4', marca: 'Yamaha', modelo: 'C40', stock: 10, precio: 89990, descripcion: 'Nailon, tapa de abeto. Ideal para estudio y flamenco.', image: '' },
  { codigo: 'GA004', categoria: 'guitarras-acusticas', nombre: 'Guitarra Electroacústica', marca: 'Takamine', modelo: 'GN20CE', stock: 3, precio: 349990, descripcion: 'Pickup integrado, afinador incorporado.', image: '' },
  { codigo: 'GA005', categoria: 'guitarras-acusticas', nombre: 'Guitarra 3/4 Niños', marca: 'Yamaha', modelo: 'JR1', stock: 6, precio: 79990, descripcion: 'Tamaño reducido para niños de 6 a 10 años.', image: '' },
  // Guitarras Eléctricas
  { codigo: 'GE001', categoria: 'guitarras-electricas', nombre: 'Guitarra Eléctrica Stratocaster', marca: 'Squier', modelo: 'Affinity Strat', stock: 5, precio: 249990, descripcion: 'Cuerpo de álamo, mástil de arce, pastillas SSS.', image: '' },
  { codigo: 'GE002', categoria: 'guitarras-electricas', nombre: 'Guitarra Eléctrica Les Paul', marca: 'Epiphone', modelo: 'Les Paul Std', stock: 4, precio: 329990, descripcion: 'Cuerpo caoba, tapa arce, pastillas humbucker.', image: '' },
  { codigo: 'GE003', categoria: 'guitarras-electricas', nombre: 'Guitarra Eléctrica SG', marca: 'Epiphone', modelo: 'SG Standard', stock: 3, precio: 319990, descripcion: 'Cuerpo caoba, mástil caoba, 2 humbuckers.', image: '' },
  { codigo: 'GE004', categoria: 'guitarras-electricas', nombre: 'Guitarra Eléctrica Telecaster', marca: 'Squier', modelo: 'Affinity Tele', stock: 4, precio: 239990, descripcion: 'Cuerpo álamo, clavijero vintage, 2 pastillas single.', image: '' },
  { codigo: 'GE005', categoria: 'guitarras-electricas', nombre: 'Guitarra Eléctrica Semi-hollow', marca: 'Epiphone', modelo: 'ES-335', stock: 2, precio: 549990, descripcion: 'Semi-hueca, 2 humbuckers, ideal para jazz y blues.', image: '' },
  // Bajos Eléctricos
  { codigo: 'BA001', categoria: 'bajos-electricos', nombre: 'Bajo Eléctrico 4 Cuerdas', marca: 'Squier', modelo: 'Affinity PJ', stock: 5, precio: 299990, descripcion: 'Pickup PJ, cuerpo álamo, mástil arce.', image: '' },
  { codigo: 'BA002', categoria: 'bajos-electricos', nombre: 'Bajo Eléctrico Jazz Bass', marca: 'Fender', modelo: 'Player Jazz', stock: 2, precio: 699990, descripcion: 'Alder body, 2 Alnico V Jazz single-coil.', image: '' },
  { codigo: 'BA003', categoria: 'bajos-electricos', nombre: 'Bajo Acústico 4 Cuerdas', marca: 'Yamaha', modelo: 'APX700II', stock: 2, precio: 429990, descripcion: 'Electroacústico, afinador incorporado.', image: '' },
  // Baterías
  { codigo: 'BT001', categoria: 'baterias', nombre: 'Batería Acústica 5 piezas', marca: 'Pearl', modelo: 'Roadshow', stock: 2, precio: 599990, descripcion: 'Incluye stands, platillos y pedal de bombo.', image: '' },
  { codigo: 'BT002', categoria: 'baterias', nombre: 'Batería Electrónica 8 pads', marca: 'Roland', modelo: 'TD-02KV', stock: 2, precio: 799990, descripcion: 'Módulo TD-02, 8 pads de goma, pedal hi-hat.', image: '' },
  { codigo: 'BT003', categoria: 'baterias', nombre: 'Caja Snare 14"', marca: 'Pearl', modelo: 'STE1450', stock: 4, precio: 89990, descripcion: 'Acero, 14x5", 10 tensores.', image: '' },
  { codigo: 'BT004', categoria: 'baterias', nombre: 'Platillo Hi-Hat 14"', marca: 'Zildjian', modelo: 'A Series', stock: 3, precio: 149990, descripcion: 'Latón B20, sonido brillante y claro.', image: '' },
  { codigo: 'BT005', categoria: 'baterias', nombre: 'Platillo Crash 16"', marca: 'Zildjian', modelo: 'A Series', stock: 3, precio: 129990, descripcion: 'Latón B20, ataque rápido.', image: '' },
  // Teclados y Pianos
  { codigo: 'TC001', categoria: 'teclados-pianos', nombre: 'Teclado Digital 61 teclas', marca: 'Yamaha', modelo: 'PSR-E373', stock: 4, precio: 249990, descripcion: '61 teclas sensibles al tacto, 622 voces.', image: '' },
  { codigo: 'TC002', categoria: 'teclados-pianos', nombre: 'Piano Digital 88 teclas', marca: 'Yamaha', modelo: 'P-45', stock: 2, precio: 499990, descripcion: '88 teclas pesadas, 10 voces, pedal sustain incluido.', image: '' },
  { codigo: 'TC003', categoria: 'teclados-pianos', nombre: 'Sintetizador 49 teclas', marca: 'Arturia', modelo: 'MiniLab MKII', stock: 5, precio: 129990, descripcion: 'MIDI controller, 49 mini teclas.', image: '' },
  { codigo: 'TC004', categoria: 'teclados-pianos', nombre: 'Teclado MIDI 88 teclas', marca: 'M-Audio', modelo: 'Hammer 88', stock: 2, precio: 399990, descripcion: '88 teclas martillo, sin sonidos propios.', image: '' },
  // Amplificadores
  { codigo: 'AM001', categoria: 'amplificadores', nombre: 'Amplificador Guitarra 15W', marca: 'Fender', modelo: 'Frontman 15G', stock: 5, precio: 99990, descripcion: '15W, distorsión incorporada, entrada auxiliar.', image: '' },
  { codigo: 'AM002', categoria: 'amplificadores', nombre: 'Amplificador Guitarra 40W', marca: 'Marshall', modelo: 'MG40GFX', stock: 3, precio: 299990, descripcion: '40W, 4 canales, efectos digitales integrados.', image: '' },
  { codigo: 'AM003', categoria: 'amplificadores', nombre: 'Amplificador Bajo 100W', marca: 'Hartke', modelo: 'HD100', stock: 2, precio: 449990, descripcion: '100W, tweeter integrado, ecualizador de 4 bandas.', image: '' },
  { codigo: 'AM004', categoria: 'amplificadores', nombre: 'Amplificador Acústico 40W', marca: 'Fishman', modelo: 'Loudbox Mini', stock: 2, precio: 499990, descripcion: '60W, 2 canales, reverb y chorus incorporados.', image: '' },
  // Micrófonos
  { codigo: 'MI001', categoria: 'microfonos', nombre: 'Micrófono Dinámico Cardioide', marca: 'Shure', modelo: 'SM58', stock: 8, precio: 149990, descripcion: 'Estándar industria para voz en vivo.', image: '' },
  { codigo: 'MI002', categoria: 'microfonos', nombre: 'Micrófono Dinámico Instrumento', marca: 'Shure', modelo: 'SM57', stock: 6, precio: 139990, descripcion: 'Ideal para captura de instrumentos y amplificadores.', image: '' },
  { codigo: 'MI003', categoria: 'microfonos', nombre: 'Micrófono Condensador', marca: 'Audio-Tech.', modelo: 'AT2020', stock: 4, precio: 199990, descripcion: 'Cardioide, XLR, ideal para grabación en estudio.', image: '' },
  { codigo: 'MI004', categoria: 'microfonos', nombre: 'Micrófono USB de Condensador', marca: 'Blue', modelo: 'Yeti', stock: 5, precio: 299990, descripcion: 'USB, 4 patrones polares, ideal para streaming y podcast.', image: '' },
  // Pedales de Efectos
  { codigo: 'PE001', categoria: 'pedales-de-efectos', nombre: 'Pedal Distorsión', marca: 'Boss', modelo: 'DS-1', stock: 7, precio: 79990, descripcion: 'Clásico pedal de distorsión, 3 controles.', image: '' },
  { codigo: 'PE002', categoria: 'pedales-de-efectos', nombre: 'Pedal Reverb', marca: 'Boss', modelo: 'RV-6', stock: 4, precio: 179990, descripcion: '8 modos de reverb, control de shimmer.', image: '' },
  { codigo: 'PE003', categoria: 'pedales-de-efectos', nombre: 'Pedal Multi-efectos', marca: 'Boss', modelo: 'ME-80', stock: 2, precio: 349990, descripcion: 'Diseño tipo pedalboard, 8 efectos simultáneos.', image: '' },
  { codigo: 'PE004', categoria: 'pedales-de-efectos', nombre: 'Pedal Tuner Cromático', marca: 'Boss', modelo: 'TU-3', stock: 8, precio: 89990, descripcion: 'Afinador cromático, indicador de tono.', image: '' },
  { codigo: 'PE005', categoria: 'pedales-de-efectos', nombre: 'Pedal Delay', marca: 'MXR', modelo: 'Carbon Copy', stock: 4, precio: 179990, descripcion: 'Delay analógico cálido, tiempo 600ms.', image: '' },
  { codigo: 'PE006', categoria: 'pedales-de-efectos', nombre: 'Pedal Overdrive', marca: 'Ibanez', modelo: 'TS9', stock: 6, precio: 99990, descripcion: 'Tube Screamer clásico, sonido suave y orgánico.', image: '' },
  // Accesorios
  { codigo: 'AC001', categoria: 'accesorios', nombre: 'Cuerdas Guitarra Eléctrica 09-42', marca: 'Ernie Ball', modelo: 'Super Slinky', stock: 25, precio: 8990, descripcion: 'Juego 6 cuerdas, calibre ligero.', image: '' },
  { codigo: 'AC002', categoria: 'accesorios', nombre: 'Cuerdas Guitarra Acústica 12-53', marca: 'Ernie Ball', modelo: 'Earthwood', stock: 20, precio: 10990, descripcion: 'Bronce fósforo, sonido cálido.', image: '' },
  { codigo: 'AC003', categoria: 'accesorios', nombre: 'Cuerdas Bajo 45-105', marca: 'Ernie Ball', modelo: 'Regular Slinky', stock: 12, precio: 14990, descripcion: 'Cuerdas de níquel enrollado, set 4 cuerdas.', image: '' },
  { codigo: 'AC004', categoria: 'accesorios', nombre: 'Púas de Guitarra x10 (0.73mm)', marca: 'Fender', modelo: '351', stock: 50, precio: 3990, descripcion: 'Celulosa, grosor medio.', image: '' },
  { codigo: 'AC005', categoria: 'accesorios', nombre: 'Capotraste Guitarra', marca: 'Dunlop', modelo: 'Trigger', stock: 15, precio: 12990, descripcion: 'Capotraste de resorte, compatible 6 cuerdas.', image: '' },
  { codigo: 'AC006', categoria: 'accesorios', nombre: 'Afinador de Clip', marca: 'Snark', modelo: 'SN-5', stock: 20, precio: 8990, descripcion: 'Afinador cromático de clip, pantalla giratoria.', image: '' },
  { codigo: 'AC007', categoria: 'accesorios', nombre: 'Cable Instrumento 3m', marca: 'Monster', modelo: 'S100-I-3', stock: 15, precio: 12990, descripcion: 'Cable trenzado, conectores dorados, 3 metros.', image: '' },
  { codigo: 'AC008', categoria: 'accesorios', nombre: 'Cable Instrumento 6m', marca: 'Monster', modelo: 'S100-I-6', stock: 10, precio: 17990, descripcion: 'Cable trenzado, conectores dorados, 6 metros.', image: '' },
  { codigo: 'AC009', categoria: 'accesorios', nombre: 'Soporte Guitarra de Piso', marca: 'Hercules', modelo: 'GS302B', stock: 12, precio: 22990, descripcion: 'Soporte plegable con enganche automático.', image: '' },
  { codigo: 'AC010', categoria: 'accesorios', nombre: 'Soporte Guitarra de Pared', marca: 'Hercules', modelo: 'WAH-202', stock: 10, precio: 18990, descripcion: 'Montaje a pared, enganche automático.', image: '' },
  // Estudio y Grabación
  { codigo: 'ES001', categoria: 'estudio-grabacion', nombre: 'Interfaz de Audio 2x2 USB', marca: 'Focusrite', modelo: 'Scarlett Solo', stock: 4, precio: 149990, descripcion: '1 entrada XLR+instrumento, 2 salidas, 24bit/192kHz.', image: '' },
  { codigo: 'ES002', categoria: 'estudio-grabacion', nombre: 'Auriculares de Estudio', marca: 'Audio-Tech.', modelo: 'ATH-M20x', stock: 6, precio: 79990, descripcion: 'Circumaurales, respuesta 15Hz-20kHz.', image: '' },
  { codigo: 'ES003', categoria: 'estudio-grabacion', nombre: 'Auriculares de Estudio Pro', marca: 'Audio-Tech.', modelo: 'ATH-M50x', stock: 4, precio: 219990, descripcion: 'Referencia de industria, sonido neutro y detallado.', image: '' },
  { codigo: 'ES004', categoria: 'estudio-grabacion', nombre: 'Monitor de Estudio 5"', marca: 'Yamaha', modelo: 'HS5', stock: 2, precio: 349990, descripcion: 'Altavoz activo, respuesta plana, ideal mezcla.', image: '' },
  { codigo: 'ES005', categoria: 'estudio-grabacion', nombre: 'Pop Filter para Micrófono', marca: 'Sennheiser', modelo: 'MZP 40', stock: 8, precio: 14990, descripcion: 'Doble malla, brazo flexible con clip.', image: '' },
]

export const getProductByCode = (codigo) => PRODUCTS.find((p) => p.codigo === codigo)
export const getCategoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug)

export const FEATURED_CODES = ['GA002', 'GE001', 'TC002', 'AM002', 'MI001', 'PE006']
export const getFeaturedProducts = () => FEATURED_CODES.map(getProductByCode).filter(Boolean)