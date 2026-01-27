// DATOS INICIALES (Basados en tu requerimiento)
// Si no existen en localStorage, se cargan estos por defecto.
const defaultData = {
    equipos: [
        { id: 1, nombre: 'CEIBA' },
        { id: 2, nombre: 'MDVR' },
        { id: 3, nombre: 'VALIDADOR' },
        { id: 4, nombre: 'RADIOS' }
    ],
    elementos: [
        { id: 1, nombre: 'PLATAFORMA', equipo: 'CEIBA' },
        { id: 2, nombre: 'INTERNET', equipo: 'CEIBA' },
        { id: 3, nombre: 'CAPA 8', equipo: 'CEIBA' },
        { id: 4, nombre: 'CÁMARA OPERADOR', equipo: 'MDVR' },
        { id: 5, nombre: 'CÁMARA PASILLO', equipo: 'MDVR' },
        { id: 6, nombre: 'CÁMARA TRASERA', equipo: 'MDVR' },
        { id: 7, nombre: 'CÁMARA VIAL', equipo: 'MDVR' },
        { id: 8, nombre: 'CONTADOR DELANTERO', equipo: 'MDVR' },
        { id: 9, nombre: 'CONTADOR TRASERO', equipo: 'MDVR' },
        { id: 10, nombre: 'BOTÓN DE PÁNICO', equipo: 'MDVR' },
        { id: 11, nombre: 'DISPLAY / TOUCH', equipo: 'VALIDADOR' },
        { id: 12, nombre: 'BOCINA', equipo: 'VALIDADOR' },
        { id: 13, nombre: 'GPS', equipo: 'VALIDADOR' },
        { id: 14, nombre: 'TRANSMISIÓN DE DATOS', equipo: 'VALIDADOR' },
        { id: 15, nombre: 'NO TRANSMITE', equipo: 'RADIOS' },
        { id: 16, nombre: 'NO FUNCIONA EL PTT', equipo: 'RADIOS' },
        { id: 17, nombre: 'NO ENCIENDE', equipo: 'RADIOS' }
    ],
    fallas: [
        { id: 1, nombre: 'NO ACCESA' },
        { id: 2, nombre: 'NO CONECTADO' },
        { id: 3, nombre: 'FUERA DE LÍNEA' },
        { id: 4, nombre: 'SIN VISIÓN DE CÁMARA' },
        { id: 5, nombre: 'FUERA DE ÁNGULO' },
        { id: 6, nombre: 'ERROR DE ALMACENAMIENTO' },
        { id: 7, nombre: 'NO GEOLOCALIZA' },
        { id: 8, nombre: 'NO CUENTA' },
        { id: 9, nombre: 'FALSO CONTACTO' },
        { id: 10, nombre: 'NO LEE TARJETAS MI' },
        { id: 11, nombre: 'NO TRANSMITE' },
        { id: 12, nombre: 'NO FUNCIONA EL TOUCH' },
        { id: 13, nombre: 'NO SE VE LA PANTALLA' },
        { id: 14, nombre: 'NO SE ESCUCHA / RONCA' }
    ],
    accesorios: [
        { id: 1, nombre: 'EQUIPO DE COMPUTO' },
        { id: 2, nombre: 'ANTENA GPS' },
        { id: 3, nombre: 'ANTENA GSM' },
        { id: 4, nombre: 'SIM DE DATOS' },
        { id: 5, nombre: 'MEMORIA SD' },
        { id: 6, nombre: 'SENSOR P1' },
        { id: 7, nombre: 'SENSOR P2' },
        { id: 8, nombre: 'ARNÉS DE ALARMAS' },
        { id: 9, nombre: 'CABLE VIDEO' },
        { id: 10, nombre: 'CABLE IPC' },
        { id: 11, nombre: 'ARNÉS DE CORRIENTE' },
        { id: 12, nombre: 'FUSIBLE' },
        { id: 13, nombre: 'RELAY' },
        { id: 14, nombre: 'DIODO' },
        { id: 15, nombre: 'TARJETA PRINCIPAL' },
        { id: 16, nombre: 'MÓDULO FEIG' },
        { id: 17, nombre: 'MÓDULO SAM' },
        { id: 18, nombre: 'TARJETA SAM' },
        { id: 19, nombre: 'INTERFACE FLANGE' },
        { id: 20, nombre: 'REDUCTOR DE VOLTAJE' }
    ],
    revision: [
        { id: 1, nombre: 'APAGADO/A' },
        { id: 2, nombre: 'NO CONECTADO' },
        { id: 3, nombre: 'OBSTRUIDO/A' },
        { id: 4, nombre: 'FALSO CONTACTO' },
        { id: 5, nombre: 'ROTO/A' },
        { id: 6, nombre: 'QUEMADO/A' },
        { id: 7, nombre: 'CONFIGURACIÓN DE FECHA Y HORA' },
        { id: 8, nombre: 'SOBRE CALENTAMIENTO' }
    ],
    solucion: [
        { id: 1, nombre: 'SE RESTABLECE CONEXIÓN' },
        { id: 2, nombre: 'SE SUSTITUYE SENSOR MAGNÉTICO' },
        { id: 3, nombre: 'SE RETIRA EQUIPO PARA SU REVISIÓN EN LABORATORIO' },
        { id: 4, nombre: 'SE CONECTA' }
    ]
};

let currentTab = 'equipos';
let catalogoData = {};
let userRole = 'supervisor'; // Por defecto

document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    verificarRol();
    renderTable(currentTab);
});

// 1. CARGA DE DATOS (LocalStorage o Default)
function cargarDatos() {
    const stored = localStorage.getItem('db_catalogos');
    if (stored) {
        catalogoData = JSON.parse(stored);
    } else {
        catalogoData = JSON.parse(JSON.stringify(defaultData)); // Clonar
        guardarDatos();
    }
}

function guardarDatos() {
    localStorage.setItem('db_catalogos', JSON.stringify(catalogoData));
}

// 2. VERIFICACIÓN DE ROL
function verificarRol() {
    const sesion = localStorage.getItem('sesion');
    if (sesion) {
        const datos = JSON.parse(sesion);
        userRole = datos.rol.toLowerCase(); // 'administrador' o 'supervisor' o 'tecnico'
    }

    // Aplicar clase al body si NO es administrador
    if (userRole !== 'administrador') {
        document.body.classList.add('readonly-mode');
    }
}

// 3. NAVEGACIÓN (TABS)
window.switchTab = function(tabName) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    currentTab = tabName;
    renderTable(tabName);
};

// 4. RENDERIZADO DE TABLAS
function renderTable(type) {
    const thead = document.getElementById('dynamic-header');
    const tbody = document.getElementById('dynamic-body');
    const title = document.getElementById('table-title');
    
    tbody.innerHTML = '';
    thead.innerHTML = '';

    const data = catalogoData[type] || [];
    
    // Configuración de columnas según tipo
    if (type === 'elementos') {
        title.innerHTML = '<i class="fas fa-microchip"></i> Catálogo de Elementos';
        thead.innerHTML = `
            <th>ID</th>
            <th>Nombre Elemento</th>
            <th>Equipo Perteneciente</th>
            <th class="action-col" style="width: 100px;">Acciones</th>
        `;
        data.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.nombre}</td>
                    <td><span class="empresa-badge">${item.equipo || 'General'}</span></td>
                    <td class="action-col">
                        <button class="btn-icon btn-danger" onclick="eliminarItem('${type}', ${item.id})" title="Eliminar">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } else {
        // Estructura genérica (Equipos, Fallas, Accesorios, etc.)
        let icon = 'fa-list';
        let nameHeader = 'Nombre / Descripción';
        if(type === 'equipos') { icon = 'fa-server'; nameHeader = 'Nombre del Equipo'; }
        if(type === 'fallas') { icon = 'fa-bug'; nameHeader = 'Descripción de Falla'; }
        
        title.innerHTML = `<i class="fas ${icon}"></i> Catálogo de ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        thead.innerHTML = `
            <th>ID</th>
            <th>${nameHeader}</th>
            <th class="action-col" style="width: 100px;">Acciones</th>
        `;
        
        data.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.nombre}</td>
                    <td class="action-col">
                        <button class="btn-icon btn-danger" onclick="eliminarItem('${type}', ${item.id})" title="Eliminar">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No hay registros</td></tr>';
    }
}

// 5. FUNCIONES DE EDICIÓN (Solo Admin)
window.abrirModalAgregar = function() {
    if (userRole !== 'administrador') return;

    document.getElementById('input-nombre').value = '';
    document.getElementById('modal-catalogo').style.display = 'flex';
    
    // Lógica especial para 'elementos' (requiere padre)
    const extraGroup = document.getElementById('group-extra');
    const extraInput = document.getElementById('input-extra');
    
    if (currentTab === 'elementos') {
        extraGroup.style.display = 'block';
        extraInput.innerHTML = '';
        catalogoData.equipos.forEach(eq => {
            extraInput.innerHTML += `<option value="${eq.nombre}">${eq.nombre}</option>`;
        });
    } else {
        extraGroup.style.display = 'none';
    }
};

window.cerrarModal = function() {
    document.getElementById('modal-catalogo').style.display = 'none';
};

window.guardarRegistro = function() {
    const nombre = document.getElementById('input-nombre').value.toUpperCase();
    if (!nombre) return alert("El nombre es obligatorio");

    const newId = Date.now(); // ID simple basado en tiempo
    const newItem = { id: newId, nombre: nombre };

    if (currentTab === 'elementos') {
        newItem.equipo = document.getElementById('input-extra').value;
    }

    catalogoData[currentTab].push(newItem);
    guardarDatos();
    renderTable(currentTab);
    cerrarModal();
};

window.eliminarItem = function(type, id) {
    if (userRole !== 'administrador') return;

    if (confirm('¿Estás seguro de eliminar este registro?')) {
        catalogoData[type] = catalogoData[type].filter(item => item.id !== id);
        guardarDatos();
        renderTable(type);
    }
};