/* ═══════════════════════════════════════════════════════════════
   APEX.SPORT — Lógica principal de la tienda
   app.js
   ═══════════════════════════════════════════════════════════════ */

/* ─── CATÁLOGO DE PRODUCTOS ──────────────────────────────────────── */
const PRODUCTS = {
  camisetas: [
    {
      id: 'c1',
      name: 'ProDry Elite',
      category: 'Camisetas',
      desc: 'Tecnología de secado rápido con malla ventilada. Ideal para entrenamientos de alta intensidad.',
      price: 24990,
      emoji: '🎽',
      badge: 'NUEVO'
    },
    {
      id: 'c2',
      name: 'Compression X-Fit',
      category: 'Camisetas',
      desc: 'Compresión muscular progresiva. Fibra reciclada 100% sostenible con protección UV50+.',
      price: 34990,
      emoji: '👕',
      badge: null
    },
    {
      id: 'c3',
      name: 'AirFlow Ultra',
      category: 'Camisetas',
      desc: 'Paneles de malla estratégicos para máxima ventilación. Corte ergonómico sin costuras.',
      price: 19990,
      emoji: '🌬️',
      badge: 'OFERTA'
    }
  ],
  pantalones: [
    {
      id: 'p1',
      name: 'FlexRun Pro',
      category: 'Pantalones',
      desc: 'Tela cuatro vías stretch. Cintura elástica ajustable con bolsillo trasero con cierre.',
      price: 39990,
      emoji: '🩳',
      badge: null
    },
    {
      id: 'p2',
      name: 'Tights Compression',
      category: 'Pantalones',
      desc: 'Mallas compresoras de segunda piel. Tecnología anti-rozadura para largas distancias.',
      price: 44990,
      emoji: '🦵',
      badge: 'NUEVO'
    },
    {
      id: 'p3',
      name: 'TrailBlaze Cargo',
      category: 'Pantalones',
      desc: 'Pantalón técnico multipocket para actividades outdoor. Resistente al agua y viento.',
      price: 54990,
      emoji: '🏔️',
      badge: null
    }
  ],
  accesorios: [
    {
      id: 'a1',
      name: 'Smartband R7',
      category: 'Accesorios',
      desc: 'Banda deportiva con sensor de pulso, GPS integrado y batería de 72 horas.',
      price: 79990,
      emoji: '⌚',
      badge: 'TOP'
    },
    {
      id: 'a2',
      name: 'Mochila Hydra 20L',
      category: 'Accesorios',
      desc: 'Mochila de hidratación con reservorio 2L, compartimento para laptop y cintas reflectivas.',
      price: 49990,
      emoji: '🎒',
      badge: null
    },
    {
      id: 'a3',
      name: 'Calcetines Grip Elite',
      category: 'Accesorios',
      desc: 'Pack x3. Suela antideslizante, acolchado en talón. Tejido antibacteriano de larga duración.',
      price: 12990,
      emoji: '🧦',
      badge: 'OFERTA'
    }
  ]
};

/* ─── UTILIDADES ─────────────────────────────────────────────────── */

/**
 * Formatea un número como precio en pesos chilenos.
 * @param {number} n
 * @returns {string}
 */
const fmt = (n) => '$' + n.toLocaleString('es-CL');

/**
 * Retorna todos los productos en un arreglo plano.
 * @returns {Array}
 */
function getAllProducts() {
  return [
    ...PRODUCTS.camisetas,
    ...PRODUCTS.pantalones,
    ...PRODUCTS.accesorios
  ];
}

/**
 * Busca un producto por su id.
 * @param {string} id
 * @returns {Object|undefined}
 */
function findProduct(id) {
  return getAllProducts().find((p) => p.id === id);
}

/* ─── SESSION STORAGE — CARRITO ──────────────────────────────────── */

const CART_KEY = 'apex_cart';

/**
 * Lee el carrito desde Session Storage.
 * @returns {Array}
 */
function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Guarda el carrito en Session Storage.
 * @param {Array} cart
 */
function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Devuelve el número total de unidades en el carrito.
 * @returns {number}
 */
function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Calcula el precio total del carrito.
 * @returns {number}
 */
function cartTotal() {
  return getCart().reduce((sum, item) => {
    const product = findProduct(item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

/* ─── RENDER DE PRODUCTOS ────────────────────────────────────────── */

/**
 * Genera el HTML de una tarjeta de producto.
 * @param {Object} p - Objeto producto
 * @returns {string}
 */
function renderCard(p) {
  return `
    <div class="card">
      ${p.badge ? `<div class="card-badge">${p.badge}</div>` : ''}
      <div class="card-img">${p.emoji}</div>
      <div class="card-body">
        <div class="card-category">${p.category}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.desc}</div>
        <div class="card-footer">
          <div class="card-price">${fmt(p.price)}</div>
          <button class="add-btn" id="btn-${p.id}" onclick="addToCart('${p.id}')">
            + Agregar
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza todas las secciones de productos en el DOM.
 */
function renderProducts() {
  const sections = [
    { key: 'camisetas',  gridId: 'grid-camisetas'  },
    { key: 'pantalones', gridId: 'grid-pantalones' },
    { key: 'accesorios', gridId: 'grid-accesorios' }
  ];

  sections.forEach(({ key, gridId }) => {
    const grid = document.getElementById(gridId);
    grid.innerHTML = PRODUCTS[key].map(renderCard).join('');
  });
}

/* ─── LÓGICA DEL CARRITO ─────────────────────────────────────────── */

/**
 * Agrega un producto al carrito o incrementa su cantidad si ya existe.
 * @param {string} id - id del producto
 */
function addToCart(id) {
  const cart = getCart();
  const index = cart.findIndex((item) => item.id === id);

  if (index >= 0) {
    cart[index].qty++;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveCart(cart);
  updateCartUI();
  showToast('Producto agregado al carrito 🛒');

  // Actualiza el botón de la tarjeta
  const btn = document.getElementById('btn-' + id);
  if (btn) {
    btn.textContent = '✓ Agregado';
    btn.classList.add('added');
  }
}

/**
 * Aumenta o disminuye la cantidad de un producto en el carrito.
 * @param {string} id
 * @param {number} delta - +1 o -1
 */
function changeQty(id, delta) {
  const cart = getCart();
  const index = cart.findIndex((item) => item.id === id);
  if (index < 0) return;

  cart[index].qty = Math.max(1, cart[index].qty + delta);
  saveCart(cart);
  updateCartUI();
}

/**
 * Elimina un producto del carrito.
 * @param {string} id
 */
function removeItem(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  updateCartUI();

  // Restaura el botón de agregar en la tarjeta
  const btn = document.getElementById('btn-' + id);
  if (btn) {
    btn.textContent = '+ Agregar';
    btn.classList.remove('added');
  }
}

/**
 * Actualiza toda la interfaz del carrito:
 * contador del nav, lista de ítems, total y estado de botones.
 */
function updateCartUI() {
  const cart = getCart();
  const count = cartCount();

  // Contador en el navbar
  const countEl = document.getElementById('cart-count');
  countEl.textContent = count;
  countEl.style.display = count > 0 ? 'flex' : 'none';

  // Lista de ítems en el sidebar
  const itemsEl = document.getElementById('cart-items');

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="emoji">🛒</span>
        Tu carrito está vacío.<br>¡Agrega productos para comenzar!
      </div>`;
  } else {
    itemsEl.innerHTML = cart.map((item) => {
      const product = findProduct(item.id);
      if (!product) return '';
      return `
        <div class="cart-item">
          <div class="cart-item-icon">${product.emoji}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-price">${fmt(product.price)}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
            </div>
          </div>
          <button class="cart-remove" onclick="removeItem('${item.id}')">✕</button>
        </div>`;
    }).join('');
  }

  // Total del carrito
  document.getElementById('cart-total-price').textContent = fmt(cartTotal());

  // Sincroniza el estado de los botones de agregar
  getAllProducts().forEach((product) => {
    const btn = document.getElementById('btn-' + product.id);
    const inCart = cart.find((item) => item.id === product.id);
    if (btn) {
      if (inCart) {
        btn.textContent = '✓ Agregado';
        btn.classList.add('added');
      } else {
        btn.textContent = '+ Agregar';
        btn.classList.remove('added');
      }
    }
  });
}

/**
 * Abre o cierra el sidebar del carrito.
 */
function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  const isOpen  = sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('show', !isOpen);
}

/* ─── CHECKOUT ───────────────────────────────────────────────────── */

/**
 * Abre el modal de checkout si hay productos en el carrito.
 */
function openCheckout() {
  if (getCart().length === 0) {
    showToast('Tu carrito está vacío');
    return;
  }
  toggleCart();
  document.getElementById('checkout-modal').classList.add('show');
}

/**
 * Cierra el modal de checkout y limpia los errores del formulario.
 */
function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('show');
  clearFormErrors();
}

/* ─── VALIDACIÓN DEL FORMULARIO ──────────────────────────────────── */

/**
 * Elimina todos los mensajes de error del formulario.
 */
function clearFormErrors() {
  ['nombre', 'direccion', 'email', 'telefono'].forEach((field) => {
    document.getElementById('f-' + field).classList.remove('error');
    document.getElementById('err-' + field).classList.remove('show');
  });
}

/**
 * Muestra el error de un campo específico.
 * @param {string} field
 */
function showErr(field) {
  document.getElementById('f-' + field).classList.add('error');
  document.getElementById('err-' + field).classList.add('show');
}

/**
 * Valida todos los campos del formulario de pago.
 * @returns {boolean} true si todos los campos son válidos
 */
function validateForm() {
  let valid = true;

  // Nombre: debe tener al menos nombre y apellido (contiene espacio)
  const nombre = document.getElementById('f-nombre').value.trim();
  if (nombre.length < 3 || !/\s/.test(nombre)) {
    showErr('nombre');
    valid = false;
  }

  // Dirección: mínimo 5 caracteres
  const dir = document.getElementById('f-direccion').value.trim();
  if (dir.length < 5) {
    showErr('direccion');
    valid = false;
  }

  // Email: debe incluir @ y dominio válido
  const email = document.getElementById('f-email').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    showErr('email');
    valid = false;
  }

  // Teléfono: solo dígitos, entre 8 y 12 caracteres
  const telefono = document.getElementById('f-telefono').value.trim();
  if (!/^\d{8,12}$/.test(telefono)) {
    showErr('telefono');
    valid = false;
  }

  return valid;
}

/**
 * Maneja el envío del formulario de pago.
 * Valida, genera el resumen del pedido y muestra la confirmación.
 * @param {Event} e
 */
function submitOrder(e) {
  e.preventDefault();
  clearFormErrors();
  if (!validateForm()) return;

  const cart     = getCart();
  const nombre   = document.getElementById('f-nombre').value.trim();
  const dir      = document.getElementById('f-direccion').value.trim();
  const email    = document.getElementById('f-email').value.trim();

  // Construye las filas del resumen de pedido
  let rows = cart.map((item) => {
    const product = findProduct(item.id);
    return `
      <div class="order-item-row">
        <span>${product.emoji} ${product.name} x${item.qty}</span>
        <span>${fmt(product.price * item.qty)}</span>
      </div>`;
  }).join('');

  rows += `
    <div class="order-total-row">
      <span>Total a pagar</span>
      <span>${fmt(cartTotal())}</span>
    </div>`;

  // Inyecta el resumen en el modal de confirmación
  document.getElementById('order-summary').innerHTML = `
    <div style="margin-bottom:8px; color:var(--muted); font-size:.75rem">
      <strong style="color:var(--text)">Envío a:</strong> ${nombre}<br>
      <strong style="color:var(--text)">Dirección:</strong> ${dir}<br>
      <strong style="color:var(--text)">Correo:</strong> ${email}
    </div>
    <div style="border-top:1px solid var(--border); padding-top:8px">${rows}</div>
  `;

  closeCheckout();
  document.getElementById('confirm-modal').classList.add('show');

  // Vacía el carrito en Session Storage
  saveCart([]);
  updateCartUI();
}

/**
 * Cierra el modal de confirmación y resetea el formulario.
 */
function closeConfirm() {
  document.getElementById('confirm-modal').classList.remove('show');
  document.getElementById('checkout-form').reset();
}

/* ─── TOAST ──────────────────────────────────────────────────────── */

/**
 * Muestra una notificación temporal (toast).
 * @param {string} msg - Mensaje a mostrar
 */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ═══════════════════════════════════════════════════════════════════
   AUTH0 — AUTENTICACIÓN
   ───────────────────────────────────────────────────────────────────
   IMPORTANTE: Reemplaza los valores de domain y clientId con
   los de tu aplicación en el Auth0 Dashboard:
   https://manage.auth0.com → Applications → Tu App
   ═══════════════════════════════════════════════════════════════════ */

const AUTH0_CONFIG = {
  domain:   'dev-zbwzooom6rhsnd4q.us.auth0.com',   // ← reemplazar
  clientId: '9Z2zn73zaSzdCqrR1StyeksTKFpNX7da',           // ← reemplazar
  authorizationParams: {
    redirect_uri: window.location.origin + window.location.pathname
  }
};

let auth0Client = null;

/**
 * Inicializa el cliente Auth0, maneja el callback de redirección
 * y actualiza la UI según el estado de autenticación.
 */
async function initAuth0() {
  try {
    auth0Client = await window.auth0.createAuth0Client(AUTH0_CONFIG);

    // Procesa el callback de Auth0 (intercambio de código por token)
    if (
      window.location.search.includes('code=') &&
      window.location.search.includes('state=')
    ) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const isAuthenticated = await auth0Client.isAuthenticated();
    if (isAuthenticated) {
      const user = await auth0Client.getUser();
      showUserUI(user);
    } else {
      showLoginUI();
    }
  } catch (err) {
    console.warn('[Auth0] No configurado aún — modo demo activo.', err.message);
    showDemoMode();
  }
}

/**
 * Muestra la información del usuario autenticado en el navbar.
 * @param {Object} user - Perfil de usuario de Auth0
 */
function showUserUI(user) {
  const section = document.getElementById('auth-section');
  const avatar  = user.picture
    ? `<img id="user-avatar" src="${user.picture}" alt="avatar" />`
    : '';
  const name = user.given_name || user.nickname || user.name || 'Atleta';

  section.innerHTML = `
    <div id="user-info">
      ${avatar}
      <span id="user-name">${name}</span>
    </div>
    <button class="btn btn-outline" onclick="doLogout()">Salir</button>
  `;

  const welcome = document.getElementById('welcome-msg');
  welcome.textContent = `¡Hola, ${name}! Bienvenido de vuelta a APEX.SPORT 🏆`;
  welcome.style.display = 'block';
}

/**
 * Muestra el botón de inicio de sesión cuando no hay sesión activa.
 */
function showLoginUI() {
  const section = document.getElementById('auth-section');
  section.innerHTML = `
    <button class="btn btn-outline" id="login-btn" onclick="doLogin()">
      Iniciar Sesión
    </button>`;
}

/**
 * Muestra un modo demo cuando Auth0 no está configurado.
 */
function showDemoMode() {
  const section = document.getElementById('auth-section');
  section.innerHTML = `
    <div id="user-info">
      <span style="font-size:1.2rem">👤</span>
      <span id="user-name">Demo User</span>
    </div>
    <span style="font-size:.7rem; color:var(--muted); padding:4px 8px;
      border:1px solid var(--border); border-radius:4px">
      DEMO — Sin Auth0
    </span>
  `;

  const welcome = document.getElementById('welcome-msg');
  welcome.textContent = '¡Bienvenido al modo demo! Configura Auth0 para autenticación real 🏆';
  welcome.style.display = 'block';
}

/**
 * Inicia el flujo de login con redirección a Auth0.
 */
async function doLogin() {
  if (!auth0Client) {
    showToast('Auth0 no está configurado aún');
    return;
  }
  await auth0Client.loginWithRedirect();
}

/**
 * Cierra la sesión del usuario en Auth0 y en la aplicación.
 */
async function doLogout() {
  if (!auth0Client) return;
  await auth0Client.logout({
    logoutParams: {
      returnTo: window.location.origin + window.location.pathname
    }
  });
}

/* ─── INICIALIZACIÓN ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();
  initAuth0();

  // Restringe el campo teléfono solo a dígitos numéricos
  document.getElementById('f-telefono').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
  });
});
