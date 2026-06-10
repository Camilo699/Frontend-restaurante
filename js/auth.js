const AUTH_URL = 'http://127.0.0.1:8001';

async function login() {
    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;
    const errorMsg = document.getElementById('error-msg');

    if (!usuario || !contrasena) {
        errorMsg.textContent = 'Por favor ingresa usuario y contraseña';
        errorMsg.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, contrasena })
        });

        const data = await response.json();

        if (data.status === 'ok') {
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.rol);
            localStorage.setItem('nombre', data.nombre);
            window.location.href = 'mesas.html';
        } else {
            errorMsg.textContent = data.mensaje;
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        errorMsg.textContent = 'Error al conectar con el servidor';
        errorMsg.classList.remove('hidden');
    }
}

function logout() {
    const token = localStorage.getItem('token');

    fetch(`${AUTH_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });

    localStorage.clear();
    window.location.href = 'login.html';
}

function verificarSesion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

function mostrarNavbarSegunRol() {
    const rol = localStorage.getItem('rol');
    const linkAdmin = document.getElementById('link-admin');
    if (linkAdmin) {
        if (rol === 'administrador') {
            linkAdmin.style.display = 'inline';
        } else {
            linkAdmin.style.display = 'none';
        }
    }
}

function mostrarBienvenida() {
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    const bienvenida = document.getElementById('bienvenida');
    if (bienvenida && nombre) {
        bienvenida.textContent = `Bienvenido, ${nombre} (${rol})`;
    }
}