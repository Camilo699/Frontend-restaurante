const PEDIDOS_URL = 'http://127.0.0.1:8004';
const PRODUCTOS_URL_P = 'http://127.0.0.1:8003';

let productosDisponibles = [];
let contadorProductos = 0;

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
    mostrarBienvenida();
    cargarPedidos();
    cargarProductosDisponibles();
    agregarProducto();
});

async function cargarProductosDisponibles() {
    try {
        const response = await fetch(`${PRODUCTOS_URL_P}/productos`, {
            headers: getHeaders()
        });
        const data = await response.json();
        productosDisponibles = data.data;
    } catch (error) {
        mostrarMsg('Error al cargar productos', 'error');
    }
}

async function cargarPedidos() {
    try {
        const response = await fetch(`${PEDIDOS_URL}/pedidos`, {
            headers: getHeaders()
        });
        const data = await response.json();
        const tabla = document.getElementById('pedidos-tabla');

        tabla.innerHTML = '';

data.data.forEach(pedido => {
    tabla.innerHTML += `
        <tr>
            <td>#${pedido.id}</td>
            <td>Mesa ${pedido.mesa_id}</td>
            <td>${pedido.fecha}</td>
            <td>${pedido.hora}</td>
            <td>$${Number(pedido.total).toLocaleString()}</td>
            <td>${pedido.estado}</td>
            <td>
                ${pedido.estado === 'pendiente'
                    ? `<button class="btn-secondary" onclick="cambiarEstado(${pedido.id}, 'en_preparacion')">Preparar</button>`
                    : ''}
                ${pedido.estado === 'en_preparacion'
                    ? `<button class="btn-secondary" onclick="cambiarEstado(${pedido.id}, 'entregado')">Entregar</button>`
                    : ''}
                ${pedido.estado === 'entregado'
                    ? `<button class="btn-secondary" onclick="cambiarEstado(${pedido.id}, 'pagado')">Pagado</button>`
                    : ''}
                ${pedido.estado === 'pagado' || pedido.estado === 'cancelado'
                    ? `<button class="btn-danger" onclick="eliminarPedido(${pedido.id})">Eliminar</button>`
                    : ''}
            </td>
        </tr>
    `;
});

    } catch (error) {
        mostrarMsg('Error al cargar pedidos', 'error');
    }
}

function agregarProducto() {
    contadorProductos++;
    const lista = document.getElementById('productos-lista');

    const opciones = productosDisponibles.map(p =>
        `<option value="${p.id}" data-precio="${p.precio}" data-nombre="${p.nombre}">
            ${p.nombre} - $${Number(p.precio).toLocaleString()}
        </option>`
    ).join('');

    lista.innerHTML += `
        <div id="producto-${contadorProductos}" style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">
            <select id="select-${contadorProductos}" style="flex:2; padding:8px; border-radius:4px; border:1px solid #2a2a2a; background:#0e0e0e; color:#d4d4d4;">
                ${opciones}
            </select>
            <input type="number" id="cantidad-${contadorProductos}" value="1" min="1"
                style="flex:1; padding:8px; border-radius:4px; border:1px solid #2a2a2a; background:#0e0e0e; color:#d4d4d4;">
            <button onclick="eliminarProducto(${contadorProductos})" class="btn-danger">✕</button>
        </div>
    `;
}

function eliminarProducto(id) {
    const el = document.getElementById(`producto-${id}`);
    if (el) el.remove();
}

async function crearPedido() {
    const mesa_id = document.getElementById('mesa_id').value;

    if (!mesa_id) {
        mostrarMsg('Ingresa el número de mesa', 'error');
        return;
    }

    const productos = [];
    const items = document.getElementById('productos-lista').children;

    for (let item of items) {
        const id = item.id.replace('producto-', '');
        const select = document.getElementById(`select-${id}`);
        const cantidad = document.getElementById(`cantidad-${id}`).value;
        const opcion = select.options[select.selectedIndex];

        productos.push({
            producto_id:     parseInt(select.value),
            nombre_producto: opcion.dataset.nombre,
            cantidad:        parseInt(cantidad),
            precio_unitario: parseFloat(opcion.dataset.precio)
        });
    }

    if (productos.length === 0) {
        mostrarMsg('Agrega al menos un producto', 'error');
        return;
    }

    try {
        const response = await fetch(`${PEDIDOS_URL}/pedidos`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ mesa_id: parseInt(mesa_id), productos })
        });

        const data = await response.json();

        if (data.status === 'ok') {
            mostrarMsg('Pedido creado correctamente', 'success');
            cargarPedidos();
        } else {
            mostrarMsg(data.mensaje, 'error');
        }
    } catch (error) {
        mostrarMsg('Error al crear pedido', 'error');
    }
}

async function cambiarEstado(id, estado) {
    try {
        const response = await fetch(`${PEDIDOS_URL}/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ estado })
        });

        const data = await response.json();

        if (data.status === 'ok') {
            mostrarMsg('Estado actualizado', 'success');
            cargarPedidos();
        }
    } catch (error) {
        mostrarMsg('Error al actualizar estado', 'error');
    }
}

function mostrarMsg(texto, tipo) {
    const msg = document.getElementById('msg');
    msg.textContent = texto;
    msg.className = tipo === 'error' ? 'error-msg' : 'success-msg';
    setTimeout(() => { msg.className = 'hidden'; }, 3000);
}

async function eliminarPedido(id) {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return;

    try {
        const response = await fetch(`${PEDIDOS_URL}/pedidos/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.status === 'ok') {
            mostrarMsg('Pedido eliminado correctamente', 'success');
            cargarPedidos();
        } else {
            mostrarMsg(data.mensaje, 'error');
        }
    } catch (error) {
        mostrarMsg('Error al eliminar pedido', 'error');
    }
}