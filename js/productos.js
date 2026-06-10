const PRODUCTOS_URL = 'http://127.0.0.1:8003';

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    mostrarNavbarSegunRol();
    cargarCategorias();
    cargarProductos();
});

async function cargarCategorias() {
    try {
        const response = await fetch(`${PRODUCTOS_URL}/categorias`, {
            headers: getHeaders()
        });
        const data = await response.json();
        const grid = document.getElementById('categorias-grid');

        grid.innerHTML = '';

        data.data.forEach(categoria => {
            grid.innerHTML += `
                <div class="card" onclick="filtrarPorCategoria(${categoria.id})" style="cursor:pointer;">
                    <h3>${categoria.nombre}</h3>
                    <p>${categoria.descripcion || 'Sin descripción'}</p>
                </div>
            `;
        });
    } catch (error) {
        mostrarMsg('Error al cargar categorías', 'error');
    }
}

async function cargarProductos() {
    try {
        const response = await fetch(`${PRODUCTOS_URL}/productos`, {
            headers: getHeaders()
        });
        const data = await response.json();
        renderizarProductos(data.data);
    } catch (error) {
        mostrarMsg('Error al cargar productos', 'error');
    }
}

async function filtrarPorCategoria(id) {
    try {
        const response = await fetch(`${PRODUCTOS_URL}/productos/categoria/${id}`, {
            headers: getHeaders()
        });
        const data = await response.json();
        renderizarProductos(data.data);
    } catch (error) {
        mostrarMsg('Error al filtrar productos', 'error');
    }
}

function renderizarProductos(productos) {
    const tabla = document.getElementById('productos-tabla');
    tabla.innerHTML = '';

    productos.forEach(producto => {
        tabla.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td>${producto.descripcion || '-'}</td>
                <td>$${Number(producto.precio).toLocaleString()}</td>
                <td>${producto.categoria ? producto.categoria.nombre : '-'}</td>
                <td>${producto.disponible ? '✅' : '❌'}</td>
            </tr>
        `;
    });
}

function mostrarMsg(texto, tipo) {
    const msg = document.getElementById('msg');
    msg.textContent = texto;
    msg.className = tipo === 'error' ? 'error-msg' : 'success-msg';
    setTimeout(() => { msg.className = 'hidden'; }, 3000);
}