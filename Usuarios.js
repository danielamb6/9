document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
    inicializarEventos();
});

// Simulación de Base de Datos inicial
const usuariosDemo = [
    { id: 1, nombre: 'Juan Pérez', username: 'jperez', email: 'juan@zoxo.com', empresa: 'Zoxo', rol: 'tecnico', activo: true },
    { id: 2, nombre: 'María Gómez', username: 'mgomez', email: 'maria@codiversa.com', empresa: 'Codiversa', rol: 'administrador', activo: true },
    { id: 3, nombre: 'Carlos Ruiz', username: 'cruiz', email: 'carlos@copesa.com', empresa: 'Copesa', rol: 'tecnico', activo: false }
];

// Obtener usuarios de LocalStorage o usar demo
function getUsuariosDB() {
    const db = localStorage.getItem('db_usuarios');
    return db ? JSON.parse(db) : usuariosDemo;
}

function saveUsuariosDB(usuarios) {
    localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
    cargarUsuarios(); // Recargar tabla
}

function inicializarEventos() {
    // Evento Guardar Formulario
    document.getElementById('usuarioForm').addEventListener('submit', function(e) {
        e.preventDefault();
        guardarUsuario();
    });

    // Evento Cancelar/Limpiar
    document.getElementById('btnCancelar').addEventListener('click', limpiarFormulario);

    // Evento Búsqueda
    document.getElementById('buscarUsuario').addEventListener('keyup', function(e) {
        const termino = e.target.value.toLowerCase();
        const usuarios = getUsuariosDB();
        const filtrados = usuarios.filter(u => 
            u.nombre.toLowerCase().includes(termino) || 
            u.username.toLowerCase().includes(termino) ||
            u.empresa.toLowerCase().includes(termino)
        );
        renderizarTabla(filtrados);
    });
}

function cargarUsuarios() {
    const usuarios = getUsuariosDB();
    renderizarTabla(usuarios);
}

function renderizarTabla(listaUsuarios) {
    const tbody = document.getElementById('tablaUsuariosBody');
    tbody.innerHTML = '';

    if(listaUsuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No se encontraron usuarios</td></tr>';
        return;
    }

    listaUsuarios.forEach(u => {
        // Badges de estilo según rol y estado (reutilizando clases de style.css donde es posible)
        const estadoHtml = u.activo 
            ? '<span class="status-badge status-resuelto">Activo</span>' 
            : '<span class="status-badge status-abierto">Inactivo</span>';
        
        let rolBadgeColor = '#34495e'; // Default
        if(u.rol === 'administrador') rolBadgeColor = '#AB096A';
        if(u.rol === 'tecnico') rolBadgeColor = '#1a2980';

        tbody.innerHTML += `
            <tr>
                <td>${u.nombre}</td>
                <td><strong>${u.username}</strong></td>
                <td><span class="empresa-badge">${u.empresa}</span></td>
                <td><span style="background:${rolBadgeColor}; color:white; padding:4px 10px; border-radius:12px; font-size:0.8rem;">${u.rol.toUpperCase()}</span></td>
                <td>${estadoHtml}</td>
                <td>
                    <button class="action-icon-btn edit-btn" onclick="cargarParaEditar(${u.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon-btn delete-btn" onclick="eliminarUsuario(${u.id})" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function guardarUsuario() {
    const id = document.getElementById('usuarioId').value;
    const nuevoUsuario = {
        id: id ? parseInt(id) : Date.now(), // ID temporal si es nuevo
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        empresa: document.getElementById('empresa').value,
        rol: document.getElementById('rol').value,
        activo: document.getElementById('activo').checked
    };

    let usuarios = getUsuariosDB();

    if (id) {
        // Editar existente
        const index = usuarios.findIndex(u => u.id == id);
        if(index !== -1) {
            usuarios[index] = { ...usuarios[index], ...nuevoUsuario };
            mostrarNotificacion('Usuario actualizado correctamente', 'success');
        }
    } else {
        // Crear nuevo
        usuarios.push(nuevoUsuario);
        mostrarNotificacion('Usuario creado correctamente', 'success');
    }

    saveUsuariosDB(usuarios);
    limpiarFormulario();
}

// Función global para ser llamada desde el HTML onclick
window.cargarParaEditar = function(id) {
    const usuarios = getUsuariosDB();
    const usuario = usuarios.find(u => u.id === id);
    
    if(usuario) {
        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('email').value = usuario.email;
        document.getElementById('username').value = usuario.username;
        document.getElementById('empresa').value = usuario.empresa;
        document.getElementById('rol').value = usuario.rol;
        document.getElementById('activo').checked = usuario.activo;
        
        // Cambiar estado visual del formulario
        document.getElementById('titulo-formulario').textContent = 'Editar Usuario';
        document.getElementById('btnGuardar').innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
        
        // Scroll suave hacia el formulario
        document.getElementById('formulario-seccion').scrollIntoView({behavior: 'smooth'});
    }
};

window.eliminarUsuario = function(id) {
    if(confirm('¿Estás seguro de eliminar este usuario?')) {
        let usuarios = getUsuariosDB();
        usuarios = usuarios.filter(u => u.id !== id);
        saveUsuariosDB(usuarios);
        mostrarNotificacion('Usuario eliminado', 'success');
    }
};

function limpiarFormulario() {
    document.getElementById('usuarioForm').reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('titulo-formulario').textContent = 'Nuevo Usuario';
    document.getElementById('btnGuardar').innerHTML = '<i class="fas fa-save"></i> Guardar Usuario';
}

function mostrarNotificacion(msg, type) {
    // Reutilizamos el estilo de notificación que ya tienes en Administrador.js si quisieras, 
    // pero creamos uno simple aquí para independencia.
    const n = document.createElement('div');
    n.style.cssText = `position:fixed;top:20px;right:20px;padding:15px;border-radius:8px;color:white;font-weight:600;z-index:9999;background:${type==='success'?'#AB096A':'#3498db'};box-shadow: 0 4px 12px rgba(0,0,0,0.2); animation: fadeIn 0.5s;`;
    n.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    document.body.appendChild(n);
    setTimeout(()=> {
        n.style.opacity = '0';
        setTimeout(()=>n.remove(), 500);
    }, 3000);
}