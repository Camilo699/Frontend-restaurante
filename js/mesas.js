const RESERVAS_URL = 'http://127.0.0.1:8002';

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
    cargarMesas();
    cargarReservas();
});

async function cargarMesas() {
    try {
        const response = await fetch(`${RESERVAS_URL}/mesas`, {
            headers: getHeaders()
        });
        const data = await response.json();
        const grid = document.getElementById('mesas-grid');
        const select = document.getElementById('mesa_id');

        grid.innerHTML = '';
        select.innerHTML = '';

        data.data.forEach(mesa => {
            grid.innerHTML += `
                <div class="card">
                    <h3>Mesa ${mesa.numero}</h3>
                    <p>Capacidad: ${mesa.capacidad} personas</p>
                    <span class="estado-${mesa.estado}">${mesa.estado.toUpperCase()}</span>
                </div>
            `;

            if (mesa.estado === 'disponible') {
                select.innerHTML += `<option value="${mesa.id}">Mesa ${mesa.numero} (${mesa.capacidad} personas)</option>`;
            }
        });
    } catch (error) {
        mostrarMsg('Error al cargar mesas', 'error');
    }
}

async function cargarReservas() {
    try {
        const response = await fetch(`${RESERVAS_URL}/reservas`, {
            headers: getHeaders()
        });
        const data = await response.json();
        const tabla = document.getElementById('reservas-tabla');

        tabla.innerHTML = '';

        data.data.forEach(reserva => {
            tabla.innerHTML += `
                <tr>
                    <td>${reserva.nombre_cliente}</td>
                    <td>${reserva.telefono_cliente}</td>
                    <td>${reserva.mesa ? 'Mesa ' + reserva.mesa.numero : reserva.mesa_id}</td>
                    <td>${reserva.fecha}</td>
                    <td>${reserva.hora}</td>
                    <td>${reserva.cantidad_personas}</td>
                    <td>${reserva.estado}</td>
                    <td>
                        ${reserva.estado === 'pendiente' || reserva.estado === 'confirmada'
                            ? `<button class="btn-danger" onclick="cancelarReserva(${reserva.id})">Cancelar</button>`
                            : '-'}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        mostrarMsg('Error al cargar reservas', 'error');
    }
}

async function crearReserva() {
    const datos = {
        nombre_cliente:    document.getElementById('nombre_cliente').value,
        telefono_cliente:  document.getElementById('telefono_cliente').value,
        cantidad_personas: document.getElementById('cantidad_personas').value,
        fecha:             document.getElementById('fecha').value,
        hora:              document.getElementById('hora').value,
        mesa_id:           document.getElementById('mesa_id').value,
        observaciones:     document.getElementById('observaciones').value
    };

    try {
        const response = await fetch(`${RESERVAS_URL}/reservas`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (data.status === 'ok') {
            mostrarMsg('Reserva creada correctamente', 'success');
            cargarMesas();
            cargarReservas();
        } else {
            mostrarMsg(data.mensaje, 'error');
        }
    } catch (error) {
        mostrarMsg('Error al crear reserva', 'error');
    }
}

async function cancelarReserva(id) {
    try {
        const response = await fetch(`${RESERVAS_URL}/reservas/${id}/cancelar`, {
            method: 'PUT',
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.status === 'ok') {
            mostrarMsg('Reserva cancelada', 'success');
            cargarMesas();
            cargarReservas();
        }
    } catch (error) {
        mostrarMsg('Error al cancelar reserva', 'error');
    }
}

function mostrarMsg(texto, tipo) {
    const msg = document.getElementById('msg');
    msg.textContent = texto;
    msg.className = tipo === 'error' ? 'error-msg' : 'success-msg';
    setTimeout(() => { msg.className = 'hidden'; }, 3000);
}