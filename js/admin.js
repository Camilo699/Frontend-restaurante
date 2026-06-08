const AUTH_URL_ADMIN = 'http://127.0.0.1:8001';

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    verificarRolAdmin();
    cargarUsuarios();
});

function verificarRolAdmin() {
    const rol = localStorage.getItem('rol');
    if (rol !== 'administrador') {
        alert('Acceso denegado. Solo administradores.');
        window.location.href = 'mesas.html';
    }
}

async function cargarUsuarios() {
    try {
        const response = await fetch(`${AUTH_URL_ADMIN}/usuarios`, {
            headers: getHeaders()
        });
        const data = await response.json();
        const tabla = document.getElementById('usuarios-tabla');

        tabla.innerHTML = '';

        data.data.forEach(usuario => {
            tabla.innerHTML += `
                <tr>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.usuario}</td>
                    <td>${usuario.correo}</td>
                    <td>${usuario.rol}</td>
                    <td>
                        <span class="${usuario.estado === 'activo' ? 'estado-disponible' : 'estado-ocupada'}">
                            ${usuario.estado.toUpperCase()}
                        </span>
                    </td>
                    <td>
                        ${usuario.estado === 'activo'
                            ? `<button class="btn-danger" onclick="cambiarEstado(${usuario.id}, 'inactivo')">Desactivar</button>`
                            : `<button class="btn-secondary" onclick="cambiarEstado(${usuario.id}, 'activo')">Activar</button>`
                        }
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        mostrarMsg('Error al cargar usuarios', 'error');
    }
}

async function crearUsuario() {
    const datos = {
        nombre:     document.getElementById('nombre').value,
        correo:     document.getElementById('correo').value,
        usuario:    document.getElementById('usuario').value,
        contrasena: document.getElementById('contrasena').value,
        rol:        document.getElementById('rol').value
    };

    if (!datos.nombre || !datos.correo || !datos.usuario || !datos.contrasena) {
        mostrarMsg('Todos los campos son obligatorios', 'error');
        return;
    }

    try {
        const response = await fetch(`${AUTH_URL_ADMIN}/usuarios`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (data.status === 'ok') {
            mostrarMsg('Usuario creado correctamente', 'success');
            cargarUsuarios();
            document.getElementById('nombre').value = '';
            document.getElementById('correo').value = '';
            document.getElementById('usuario').value = '';
            document.getElementById('contrasena').value = '';
        } else {
            mostrarMsg(data.mensaje, 'error');
        }
    } catch (error) {
        mostrarMsg('Error al crear usuario', 'error');
    }
}

async function cambiarEstado(id, estado) {
    try {
        const response = await fetch(`${AUTH_URL_ADMIN}/usuarios/${id}/estado`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ estado })
        });

        const data = await response.json();

        if (data.status === 'ok') {
            mostrarMsg('Estado actualizado correctamente', 'success');
            cargarUsuarios();
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