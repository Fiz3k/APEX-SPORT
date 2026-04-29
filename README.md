APEX.SPORT
Documentación Técnica
Flujo de Autenticación · Gestión de Productos · Protección de Sesión

Versión 1.0  |  Abril 2025  |  Proyecto de Tienda Virtual

Introducción
Este documento describe el funcionamiento técnico de APEX.SPORT, una tienda virtual deportiva desarrollada en HTML, CSS y JavaScript. Se explican en detalle tres aspectos clave del sistema: el flujo de autenticación con Auth0, el proceso de selección de productos y gestión del carrito, y la protección de la sesión mediante Session Storage.

🏆 Tecnologías utilizadas
HTML5 · CSS3 · JavaScript ES6+ · Auth0 SPA SDK v2 · Session Storage API · docx-js

1. Flujo de Autenticación con Auth0
La autenticación se delega completamente a Auth0, un proveedor de identidad basado en la nube. Esto permite implementar un sistema seguro de inicio de sesión sin gestionar contraseñas ni tokens JWT manualmente.

1.1 Inicialización del cliente Auth0
Al cargar la página, la función initAuth0() crea una instancia del cliente Auth0 con la configuración del tenant:

auth0Client = await auth0.createAuth0Client({
  domain:   'tu-tenant.auth0.com',
  clientId: 'TU_CLIENT_ID',
  authorizationParams: {
    redirect_uri: window.location.origin
  }
});

1.2 Proceso de inicio de sesión (paso a paso)

1.	Paso 1: El usuario hace clic en el botón "Iniciar Sesión".
2.	Paso 2: La aplicación llama a auth0Client.loginWithRedirect(), redirigiendo al usuario al servidor de Auth0.
3.	Paso 3: El usuario introduce sus credenciales en el formulario seguro de Auth0 (universal login).
4.	Paso 4: Auth0 valida las credenciales y emite un código de autorización (authorization code flow).
5.	Paso 5: El navegador redirige de vuelta a la aplicación con el código en la URL (?code=&state=).
6.	Paso 6: La aplicación llama a handleRedirectCallback() para canjear el código por un token de acceso.
7.	Paso 7: Se recupera el perfil del usuario con getUser() y se muestra el mensaje de bienvenida.

🔐 Seguridad gestionada por Auth0
No se manipulan tokens JWT directamente. Auth0 maneja el cifrado, la validación y la renovación de tokens de forma automática mediante el SDK oficial.

1.3 Verificación del estado de autenticación
Cada vez que se carga la página, la aplicación verifica si el usuario ya tiene una sesión activa:

const isAuthenticated = await auth0Client.isAuthenticated();
if (isAuthenticated) {
  const user = await auth0Client.getUser();
  showUserUI(user);  // muestra nombre y avatar
}

1.4 Cierre de sesión
El logout revoca la sesión tanto en la aplicación como en el servidor de Auth0:

await auth0Client.logout({
  logoutParams: { returnTo: window.location.origin }
});

2. Proceso de Selección de Productos
La tienda ofrece 9 productos distribuidos en tres categorías: camisetas deportivas, pantalones deportivos y accesorios. La gestión del catálogo y el carrito se realiza mediante JavaScript puro con Session Storage como capa de persistencia.

2.1 Estructura de datos del catálogo
Los productos se definen como un objeto JavaScript con tres arreglos (uno por categoría). Cada producto contiene:

•	id: identificador único del producto (ej. "c1", "p2", "a3").
•	name: nombre comercial del producto.
•	category: categoría a la que pertenece.
•	desc: descripción breve con características técnicas.
•	price: precio en pesos chilenos (CLP).
•	emoji: ícono visual representativo.
•	badge: etiqueta promocional opcional (NUEVO, OFERTA, TOP).

2.2 Renderizado dinámico del catálogo
La función renderProducts() recorre el objeto PRODUCTS y genera el HTML de cada tarjeta usando template literals. Las tarjetas incluyen imagen/emoji, nombre, descripción, precio y el botón "Agregar al carrito". Al hacer clic en ese botón se invoca addToCart(id).

2.3 Lógica de addToCart(id)
Cuando el usuario hace clic en "Agregar al carrito", el sistema:

8.	Lee el carrito actual desde Session Storage (getCart()).
9.	Busca si el producto ya existe en el carrito.
10.	Si existe, incrementa su cantidad (qty++). Si no, lo agrega con qty: 1.
11.	Guarda el carrito actualizado en Session Storage (saveCart(cart)).
12.	Llama a updateCartUI() para reflejar los cambios visualmente.
13.	Muestra una notificación toast y cambia el botón a "✓ Agregado".

🛒 Carrito en tiempo real
El contador de artículos en el navbar y el sidebar del carrito se actualizan de forma inmediata después de cada operación, sin recargar la página.

2.4 Gestión de cantidades y eliminación
Desde el carrito lateral el usuario puede aumentar o disminuir la cantidad de cada producto usando los botones + y −. La función changeQty(id, delta) asegura que la cantidad mínima sea siempre 1. La función removeItem(id) elimina el producto del carrito y restablece el botón de agregar en la tarjeta correspondiente.

3. Protección de la Sesión con Session Storage
Session Storage es una API del navegador que permite almacenar datos de forma temporal, vinculados exclusivamente a la pestaña o ventana activa. A diferencia de Local Storage, los datos se eliminan automáticamente cuando el usuario cierra la pestaña o el navegador.

3.1 Clave de almacenamiento
Todos los datos del carrito se guardan bajo una única clave constante:

const CART_KEY = 'apex_cart';

3.2 Operaciones CRUD del carrito

Leer el carrito
function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

Guardar el carrito
function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

3.3 Persistencia durante la navegación
Mientras el usuario navega dentro de la misma pestaña (sin cerrarla), los productos del carrito se mantienen disponibles. Cada vez que se renderiza el carrito, se lee desde Session Storage, garantizando que la vista siempre refleje el estado real almacenado.

🔒 Alcance de la sesión
Session Storage es aislado por pestaña. Si el usuario abre una nueva pestaña de la tienda, tendrá un carrito independiente. Esta característica protege contra interferencias entre sesiones de usuario en dispositivos compartidos.

3.4 Eliminación de datos al finalizar la compra
Cuando el usuario completa el formulario de pago y confirma el pedido, el carrito se vacía inmediatamente:

// Al confirmar el pedido:
saveCart([]);     // guarda arreglo vacío
updateCartUI();  // actualiza la interfaz

Esto sobrescribe el valor en Session Storage con un arreglo vacío, efectivamente eliminando todos los productos seleccionados.

3.5 Eliminación automática al cerrar sesión
Cuando el usuario hace logout a través de Auth0, la sesión del navegador termina y la pestaña es redirigida. En ese proceso, Session Storage se limpia de forma natural por el navegador. Adicionalmente, al iniciar sesión de nuevo, el sistema parte desde un carrito vacío sin residuos de sesiones anteriores.

3.6 Cuadro resumen de ciclo de vida del carrito

Evento	Acción en Session Storage	Resultado
Agregar producto	setItem(CART_KEY, [...])	Producto persistido
Cambiar cantidad	setItem(CART_KEY, [...])	Cantidad actualizada
Eliminar producto	setItem(CART_KEY, [...])	Producto removido
Confirmar pedido	setItem(CART_KEY, [])	Carrito vaciado
Cerrar pestaña	Limpieza automática	Sesión eliminada
Abrir nueva pestaña	Session Storage vacío	Carrito en blanco

Conclusión
APEX.SPORT combina tres tecnologías complementarias para ofrecer una experiencia de compra segura y fluida. Auth0 garantiza la autenticación sin exponer credenciales en el frontend. Session Storage provee persistencia temporal y segura del carrito sin depender de un backend. JavaScript modular gestiona la lógica de productos y formularios con validaciones robustas del lado del cliente.

Esta arquitectura es escalable: puede extenderse con una API REST, base de datos y pasarela de pago real sin modificar la capa de presentación.

📌 Próximos pasos sugeridos
Integrar Stripe para pagos reales · Agregar backend con Node.js + Express · Conectar base de datos para historial de pedidos · Implementar Auth0 Roles para panel de administrador

