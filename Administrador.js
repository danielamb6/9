let ticketsData = [];
let chartInstances = [];
let currentTab = 'tab-equipos';
let currentModalType = ''; 

// --- BASE DE DATOS SIMULADA ---
// Tecnicos ahora tienen propiedad 'tipo' (TI o Mantenimiento)
// URL BASE (Asegúrate que coincida con tu puerto de Flask)
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', function() {
    // ... (tu código de sesión existente) ...
    
    // CARGAS INICIALES DE BASE DE DATOS
    cargarEspecialidadesSelect(); // Llenar el dropdown del modal
    cargarTecnicosDesdeBD();      // Llenar la tabla y tarjetas
    
    // ... (resto de tus inicializaciones de fechas, eventos, etc.) ...
});

// --- FUNCIONES DE CONEXIÓN (NUEVAS) ---

// 1. Cargar Técnicos de la BD
async function cargarTecnicosDesdeBD() {
    try {
        const response = await fetch(`${API_BASE_URL}/tecnicos`);
        const tecnicos = await response.json();
        
        // Renderizar Tablas y Cards con los datos reales
        renderGestionTecnicosBD(tecnicos);
        renderAllTecnicosCardsBD(tecnicos);
        
    } catch (error) {
        console.error("Error cargando técnicos:", error);
    }
}

// 2. Cargar Especialidades en el Select del Modal
async function cargarEspecialidadesSelect() {
    try {
        const response = await fetch(`${API_BASE_URL}/especialidades`);
        const especialidades = await response.json();
        
        const select = document.getElementById('input-tipo-tecnico');
        select.innerHTML = ''; // Limpiar opciones anteriores
        
        especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.id; // El valor será el ID (ej: 1)
            option.textContent = esp.especialidad; // El texto será el nombre (ej: TI)
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando especialidades:", error);
    }
}

// 3. Renderizar Tabla de Técnicos (Modificada para usar datos de BD)
function renderGestionTecnicosBD(listaTecnicos) {
    const tbody = document.getElementById('tabla-gestion-tecnicos');
    if(!tbody) return;
    tbody.innerHTML = '';

    // Obtener rol del usuario actual para permisos
    const sesion = JSON.parse(localStorage.getItem('sesion') || '{}');
    const rolUsuario = (sesion.rol || '').toLowerCase();

    listaTecnicos.forEach(tec => {
        const estadoClass = tec.activo ? 'status-resuelto' : 'status-abierto';
        const estadoText = tec.activo ? 'Activo' : 'Inactivo';
        
        // Badge simple para el departamento/especialidad
        const tipoBadge = `<span class="role-badge" style="background:#3498db;">${tec.tipo || 'General'}</span>`;

        let actions = '<span style="color:#999;">Solo lectura</span>';
        if(rolUsuario === 'administrador') {
            const btnColor = tec.activo ? '#e74c3c' : '#27ae60';
            const btnIcon = tec.activo ? 'fa-ban' : 'fa-check';
            // Nota: Llamamos a una nueva función toggleEstadoTecnicoBD
            actions = `<button class="btn-icon" style="color:${btnColor};" onclick="toggleEstadoTecnicoBD(${tec.id})"><i class="fas ${btnIcon}"></i></button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>${tec.nombre_completo}</td>
                <td>${tipoBadge}</td>
                <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
                <td class="col-accion">${actions}</td>
            </tr>
        `;
    });
}

// 4. Renderizar Tarjetas de Resumen (Modificada)
function renderAllTecnicosCardsBD(listaTecnicos) {
    const container = document.getElementById('tecnicos-list-container');
    if(!container) return;
    container.innerHTML = '';
    
    listaTecnicos.forEach(tec => {
        if(!tec.activo) return; // Solo mostrar activos en las tarjetas
        // Aquí podrías filtrar incidencias reales si tuvieras la tabla de tickets conectada
        // Por ahora mostramos 0 incidencias o un número simulado
        container.innerHTML += `
            <div class="summary-card">
                <i class="fas fa-user-tie"></i>
                <h3>${tec.nombre_completo}</h3>
                <p style="font-size:0.8rem">${tec.tipo}</p>
            </div>`;
    });
}

// 5. Guardar Nuevo Técnico en BD
async function guardarNuevoTecnicoBD() {
    const nombre = document.getElementById('input-agregar-nombre').value.trim();
    const idEspecialidad = document.getElementById('input-tipo-tecnico').value; // Ahora envía el ID

    if (!nombre) return alert("Escribe un nombre");

    const data = {
        nombre: nombre,
        id_especialidad: parseInt(idEspecialidad),
        id_telegram: 0 // Valor por defecto o agrega un input en el HTML si lo necesitas
    };

    try {
        const res = await fetch(`${API_BASE_URL}/tecnicos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if(res.ok) {
            alert('Técnico agregado exitosamente');
            cerrarModalAgregar();
            cargarTecnicosDesdeBD(); // Recargar la tabla visualmente
        } else {
            alert('Error al guardar en base de datos');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
}

// 6. Cambiar Estado en BD
async function toggleEstadoTecnicoBD(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/tecnicos/${id}/estado`, {
            method: 'PUT'
        });
        if(res.ok) {
            cargarTecnicosDesdeBD(); // Recargar tabla para ver el cambio de icono
        } else {
            alert("No se pudo cambiar el estado");
        }
    } catch (error) {
        console.error(error);
    }
}

// --- MODIFICACIÓN DE TU FUNCIÓN ORIGINAL 'guardarNuevoGenerico' ---
// Necesitas modificar tu función existente para que llame a nuestra nueva función de BD
window.guardarNuevoGenerico = function() {
    // Si el modal actual es de técnicos, usamos la nueva lógica
    if(currentModalType === 'tecnico') {
        guardarNuevoTecnicoBD();
        return; 
    }

    // ... (Aquí sigue tu código original para empresas, clientes y catálogos que aún no conectamos) ...
    const nombre = document.getElementById('input-agregar-nombre').value.trim();
    if (!nombre) return alert("Escribe un nombre");
    // ... Resto de la lógica original para simulaciones ...
    // ...
    cerrarModalAgregar();
    showNotification('Agregado correctamente (Simulado)', 'success');
};
// Datos Gestión Técnica
const gestionData = {
    equipos: ['CEIBA', 'MDVR', 'VALIDADOR', 'RADIOS'],
    elementos: ['PLATAFORMA', 'CÁMARA OPERADOR', 'CÁMARA PASILLO', 'CÁMARA TRASERA', 'CÁMARA VIAL', 'CONTADOR DELANTERO', 'CONTADOR TRASERO', 'BOTÓN DE PANICO', 'ARNES DE ALARMAS', 'CABLE VIDEO', 'CABLE IPC', 'ARNES DE CORRIENTE', 'FUSIBLE', 'RELAY', 'DIODO', 'DISPLAY / TOUCH', 'BOCINA', 'GPS', 'TRANSMISION DE DATOS', 'NO ENCIENDE', 'INTERFACE FLANGE', 'SIM DE DATOS', 'REDUCTOR DE VOLTAJE', 'VOLUMEN'],
    fallas: ['NO ACCESA', 'FUERA DE LINEA', 'SIN VISION DE CÁMARA', 'FUERA DE ANGULO', 'ERROR DE ALMACENAMIENTO', 'NO GEOLOCALIZA', 'NO CUENTA', 'FALSO CONTACTO', 'ROTO/A', 'QUEMADO/A', 'NO LEE TARJETAS MI', 'NO TRANSMITE', 'NO FUNCIONA EL TOUCH', 'NO SE VE LA PANTALLA', 'NO SE ESCUCHA / RONCA', 'NO FUNCIONA EL PTT'],
    accesorios: ['EQUIPO DE COMPUTO', 'INTERNET', 'CAPA 8', 'ANTENA GPS', 'ANTENA GSM', 'SIM DE DATOS', 'MEMORIA SD', 'SENSOR P1', 'SENSOR P2', 'TARJETA PRINCIPAL', 'MODULO FEIG', 'MODULOS GSM', 'MODULO SAM', 'TARJETA SAM'],
    revision: ['APAGADO/A', 'NO CONECTADO', 'OBSTRUIDO/A', 'FALSO CONTACTO', 'ROTO/A', 'QUEMADO/A', 'CONFIGURACIÓN DE FECHA Y HORA', 'SOBRE CALENTAMIENTO'],
    solucion: ['SE RESTABLECE CONEXIÓN', 'SE SUSTITUYE SENSOR MAGNÉTICO', 'SE RETIRA EQUIPO PARA SU REVISIÓN EN LABORATORIO', 'SE CONECTA']
};

const tiposFalla = ['EQUIPOS - MDVR', 'ELEMENTOS - Cámara Operador', 'ACCESORIOS - Antena GPS', 'FALLA REPORTADA - No accesa'];
const estados = ['abierto', 'espera', 'cerrado', 'resuelto'];
const estadosTexto = ['Abierto', 'En Espera', 'Cerrado', 'Resuelto'];

document.addEventListener('DOMContentLoaded', function() {
    const sesion = localStorage.getItem('sesion');
    let userRole = 'tecnico';
    if (sesion) {
        const datosUsuario = JSON.parse(sesion);
        userRole = datosUsuario.rol.toLowerCase();
    }

    inicializarFechas();
    inicializarDatos(); 
    inicializarEventos();
    inicializarNavegacion(); 
    
    // Renderizados
    actualizarVista();
    renderAllTechTables(userRole);
    renderGestionTecnicos(userRole); 
    renderGestionEmpresas(userRole);
    renderGestionClientes(userRole); 
    renderAllTecnicosCards();
    renderAllEmpresasCards();
    renderAllClientesCards(); 
});

// --- GENERACIÓN DE DATOS CON FECHAS DETALLADAS ---
function inicializarDatos() {
    ticketsData = [];
    const hoy = new Date();
    const tecActivos = tecnicosDB.filter(t => t.activo).map(t => t.nombre);
    const empActivas = empresasDB.filter(e => e.activo).map(e => e.nombre);

    for (let i = 1; i <= 48; i++) {
        // Generar 4 fechas distintas coherentes
        const fechaBase = new Date();
        fechaBase.setDate(hoy.getDate() - Math.floor(Math.random() * 30));
        
        // Fecha Creación Ticket
        const fCreacion = new Date(fechaBase);
        fCreacion.setHours(8 + Math.floor(Math.random()*2), Math.floor(Math.random()*59));

        // Fecha Inicio Técnico (30 min a 2 horas después de creación)
        const fInicio = new Date(fCreacion);
        fInicio.setMinutes(fInicio.getMinutes() + 30 + Math.floor(Math.random()*90));

        // Fecha Reparación (1 a 4 horas después de inicio)
        const fReparacion = new Date(fInicio);
        fReparacion.setMinutes(fReparacion.getMinutes() + 60 + Math.floor(Math.random()*180));

        // Fecha Finalización (Cierre) (15 min después de reparación)
        const fFinal = new Date(fReparacion);
        fFinal.setMinutes(fFinal.getMinutes() + 15);

        const estadoIndex = Math.floor(Math.random() * estados.length);
        
        ticketsData.push({
            id: i,
            tecnico: tecActivos[Math.floor(Math.random() * tecActivos.length)] || 'Desconocido',
            empresa: empActivas[Math.floor(Math.random() * empActivas.length)] || 'Desconocida',
            fecha: fCreacion.toLocaleDateString('es-ES'), // Para la tabla resumen
            tiempo: (Math.random() * 5 + 0.5).toFixed(1) + 'h',
            tipoFalla: tiposFalla[Math.floor(Math.random() * tiposFalla.length)],
            estado: estados[estadoIndex],
            estadoTexto: estadosTexto[estadoIndex],
            // Fechas detalladas formateadas
            dates: {
                creacion: formatDate(fCreacion),
                inicio: formatDate(fInicio),
                reparacion: formatDate(fReparacion),
                final: formatDate(fFinal)
            }
        });
    }
}

function formatDate(date) {
    return date.toLocaleString('es-ES', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit' 
    });
}

// --- NAVEGACIÓN ---
function inicializarNavegacion() {
    const links = document.querySelectorAll('.menu-link');
    const views = {
        'nav-dashboard': 'view-dashboard',
        'nav-incidencias': 'view-incidencias',
        'nav-tecnicos': 'view-tecnicos',
        'nav-empresas': 'view-empresas',
        'nav-clientes': 'view-clientes', // Nueva vista
        'nav-reportes': 'view-reportes',
        'nav-gestion-tecnica': 'view-gestion-tecnica'
    };

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if(link.getAttribute('href').includes('.html')) return; 
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            Object.values(views).forEach(viewId => {
                const el = document.getElementById(viewId);
                if(el) el.style.display = 'none';
            });
            
            const targetId = views[link.id];
            if(targetId) {
                document.getElementById(targetId).style.display = 'block';
                if(targetId === 'view-incidencias') renderAllIncidencias();
                if(targetId === 'view-reportes') renderReportesHistory();
            }
        });
    });
}

// --- GESTIÓN TÉCNICA (PESTAÑAS) ---
window.cambiarTab = function(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.tech-tab').forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
};

function renderAllTechTables(role) {
    renderTechTable('body-equipos', gestionData.equipos, role, 'equipos');
    renderTechTable('body-elementos', gestionData.elementos, role, 'elementos');
    renderTechTable('body-fallas', gestionData.fallas, role, 'fallas');
    renderTechTable('body-accesorios', gestionData.accesorios, role, 'accesorios');
    renderTechTable('body-revision', gestionData.revision, role, 'revision');
    renderTechTable('body-solucion', gestionData.solucion, role, 'solucion');
}

function renderTechTable(tbodyId, dataArray, role, type) {
    const tbody = document.getElementById(tbodyId);
    if(!tbody) return;
    tbody.innerHTML = '';
    
    dataArray.forEach((item, index) => {
        let actionHtml = role === 'administrador' 
            ? `<button class="btn-icon" style="color:red;" onclick="eliminarItemCatalogo('${type}', ${index})" title="Eliminar"><i class="fas fa-trash-alt"></i></button>`
            : '<span style="color:#999; font-size:0.8rem;">Solo lectura</span>';
        tbody.innerHTML += `<tr><td>${item}</td><td class="col-accion">${actionHtml}</td></tr>`;
    });
}

// --- GESTIÓN DETALLADA: TÉCNICOS (CON ROL TI/MANTENIMIENTO) ---
function renderGestionTecnicos(role) {
    const tbody = document.getElementById('tabla-gestion-tecnicos');
    if(!tbody) return;
    tbody.innerHTML = '';

    tecnicosDB.forEach(tec => {
        const estadoClass = tec.activo ? 'status-resuelto' : 'status-abierto';
        const estadoText = tec.activo ? 'Activo' : 'Inactivo';
        
        // Badge para departamento
        const tipoBadge = tec.tipo === 'TI' 
            ? '<span class="role-badge" style="background:#3498db;">TI</span>' 
            : '<span class="role-badge" style="background:#e67e22;">Mantenimiento</span>';

        let actions = '<span style="color:#999;">Solo lectura</span>';
        if(role === 'administrador') {
            const btnColor = tec.activo ? '#e74c3c' : '#27ae60';
            const btnIcon = tec.activo ? 'fa-ban' : 'fa-check';
            actions = `<button class="btn-icon" style="color:${btnColor};" onclick="toggleEstadoEntidad('tecnico', ${tec.id})"><i class="fas ${btnIcon}"></i></button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>${tec.nombre}</td>
                <td>${tipoBadge}</td>
                <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
                <td class="col-accion">${actions}</td>
            </tr>
        `;
    });
}

// --- GESTIÓN DETALLADA: EMPRESAS (CON ULTIMA INCIDENCIA) ---
function renderGestionEmpresas(role) {
    const tbody = document.getElementById('tabla-gestion-empresas');
    if(!tbody) return;
    tbody.innerHTML = '';

    empresasDB.forEach(emp => {
        const estadoClass = emp.activo ? 'status-resuelto' : 'status-abierto';
        
        // Buscar ultima incidencia realizada
        const incidenciasEmpresa = ticketsData.filter(t => t.empresa === emp.nombre);
        const ultimaIncidencia = incidenciasEmpresa.length > 0 ? incidenciasEmpresa[0].tipoFalla : 'Sin registros';

        let actions = role === 'administrador'
            ? `<button class="btn-icon" style="color:${emp.activo?'#e74c3c':'#27ae60'};" onclick="toggleEstadoEntidad('empresa', ${emp.id})"><i class="fas ${emp.activo?'fa-ban':'fa-check'}"></i></button>`
            : '<span style="color:#999;">Solo lectura</span>';

        tbody.innerHTML += `
            <tr>
                <td>${emp.nombre}</td>
                <td style="font-size:0.9rem;">${ultimaIncidencia}</td>
                <td><span class="status-badge ${estadoClass}">${emp.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td class="col-accion">${actions}</td>
            </tr>
        `;
    });
}

// --- GESTIÓN DETALLADA: CLIENTES (NUEVO) ---
function renderGestionClientes(role) {
    const tbody = document.getElementById('tabla-gestion-clientes');
    if(!tbody) return;
    tbody.innerHTML = '';

    clientesDB.forEach(cli => {
        const estadoClass = cli.activo ? 'status-resuelto' : 'status-abierto';
        
        let actions = role === 'administrador'
            ? `<button class="btn-icon" style="color:${cli.activo?'#e74c3c':'#27ae60'};" onclick="toggleEstadoEntidad('cliente', ${cli.id})"><i class="fas ${cli.activo?'fa-ban':'fa-check'}"></i></button>`
            : '<span style="color:#999;">Solo lectura</span>';

        tbody.innerHTML += `
            <tr>
                <td>${cli.nombre}</td>
                <td>${cli.empresa}</td>
                <td><span class="status-badge ${estadoClass}">${cli.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td class="col-accion">${actions}</td>
            </tr>
        `;
    });
}

// --- TOGGLE ESTADOS ---
window.toggleEstadoEntidad = function(tipo, id) {
    let db, renderFunc, cardsFunc;
    
    if(tipo === 'tecnico') { db = tecnicosDB; renderFunc = renderGestionTecnicos; cardsFunc = renderAllTecnicosCards; }
    if(tipo === 'empresa') { db = empresasDB; renderFunc = renderGestionEmpresas; cardsFunc = renderAllEmpresasCards; }
    if(tipo === 'cliente') { db = clientesDB; renderFunc = renderGestionClientes; cardsFunc = renderAllClientesCards; }

    const item = db.find(t => t.id === id);
    if(item) {
        item.activo = !item.activo;
        const role = JSON.parse(localStorage.getItem('sesion')).rol.toLowerCase();
        renderFunc(role);
        cardsFunc();
    }
};

// --- VISUALIZACIÓN TARJETAS (CARDS) ---
function renderAllTecnicosCards() {
    const container = document.getElementById('tecnicos-list-container');
    if(!container) return;
    container.innerHTML = '';
    tecnicosDB.forEach(tec => {
        if(!tec.activo) return; 
        const count = ticketsData.filter(t => t.tecnico === tec.nombre).length;
        container.innerHTML += `<div class="summary-card"><i class="fas fa-user-tie"></i><h3>${tec.nombre}</h3><p>${count} Incidencias</p></div>`;
    });
}

function renderAllEmpresasCards() {
    const container = document.getElementById('empresas-list-container');
    if(!container) return;
    container.innerHTML = '';
    empresasDB.forEach(emp => {
        if(!emp.activo) return;
        const count = ticketsData.filter(t => t.empresa === emp.nombre).length;
        container.innerHTML += `<div class="summary-card"><i class="fas fa-building"></i><h3>${emp.nombre}</h3><p>${count} Reportes</p></div>`;
    });
}

function renderAllClientesCards() {
    const container = document.getElementById('clientes-list-container');
    if(!container) return;
    container.innerHTML = '';
    clientesDB.forEach(cli => {
        if(!cli.activo) return;
        container.innerHTML += `<div class="summary-card"><i class="fas fa-user-tie"></i><h3>${cli.nombre}</h3><p>${cli.empresa}</p></div>`;
    });
}

// --- HISTORIAL DE REPORTES DETALLADO (4 FECHAS) ---
function renderReportesHistory() {
    const tbody = document.getElementById('reportes-history-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    // Usamos los ticketsData que ya generamos con las 4 fechas
    ticketsData.forEach(t => {
        tbody.innerHTML += `
            <tr>
                <td>#${t.id}</td>
                <td>${t.tecnico}</td>
                <td>${t.dates.creacion}</td>
                <td>${t.dates.inicio}</td>
                <td>${t.dates.reparacion}</td>
                <td>${t.dates.final}</td>
                <td><span class="status-badge status-${t.estado}">${t.estadoTexto}</span></td>
            </tr>
        `;
    });
}

// --- MODALES DE AGREGADO ---
window.abrirModalAgregar = function(tipo) {
    currentModalType = tipo; 
    document.getElementById('input-agregar-nombre').value = '';
    
    // Resetear visibilidad de selector TI
    document.getElementById('group-tipo-tecnico').style.display = 'none';

    let titulo = 'Agregar';
    if(tipo === 'tecnico') {
        titulo = 'Agregar Nuevo Técnico';
        document.getElementById('group-tipo-tecnico').style.display = 'block'; // Mostrar selector
    }
    if(tipo === 'empresa') titulo = 'Agregar Nueva Empresa';
    if(tipo === 'cliente') titulo = 'Agregar Nuevo Cliente';
    if(tipo === 'catalogo') titulo = 'Agregar Item al Catálogo';

    document.getElementById('modal-titulo').innerHTML = `<i class="fas fa-plus-circle"></i> ${titulo}`;
    document.getElementById('modal-agregar-generico').style.display = 'flex';
    document.getElementById('input-agregar-nombre').focus();
};

window.cerrarModalAgregar = function() {
    document.getElementById('modal-agregar-generico').style.display = 'none';
};

window.guardarNuevoGenerico = function() {
    const nombre = document.getElementById('input-agregar-nombre').value.trim();
    if (!nombre) return alert("Escribe un nombre");
    
    const role = JSON.parse(localStorage.getItem('sesion')).rol.toLowerCase();

    if(currentModalType === 'tecnico') {
        const tipoTec = document.getElementById('input-tipo-tecnico').value;
        const newId = tecnicosDB.length > 0 ? Math.max(...tecnicosDB.map(t=>t.id)) + 1 : 1;
        tecnicosDB.push({ id: newId, nombre: nombre, tipo: tipoTec, activo: true });
        renderGestionTecnicos(role);
        renderAllTecnicosCards();
    } 
    else if(currentModalType === 'empresa') {
        const newId = empresasDB.length > 0 ? Math.max(...empresasDB.map(e=>e.id)) + 1 : 1;
        empresasDB.push({ id: newId, nombre: nombre, activo: true });
        renderGestionEmpresas(role);
        renderAllEmpresasCards();
    }
    else if(currentModalType === 'cliente') {
        const newId = clientesDB.length > 0 ? Math.max(...clientesDB.map(c=>c.id)) + 1 : 1;
        clientesDB.push({ id: newId, nombre: nombre, empresa: 'Sin Asignar', activo: true });
        renderGestionClientes(role);
        renderAllClientesCards();
    }
    else if(currentModalType === 'catalogo') {
        let targetArray = '';
        if(currentTab === 'tab-equipos') targetArray = 'equipos';
        else if(currentTab === 'tab-elementos') targetArray = 'elementos';
        else if(currentTab === 'tab-fallas') targetArray = 'fallas';
        else if(currentTab === 'tab-accesorios') targetArray = 'accesorios';
        else if(currentTab === 'tab-revision') targetArray = 'revision';
        else if(currentTab === 'tab-solucion') targetArray = 'solucion';
        
        if(targetArray) {
            gestionData[targetArray].push(nombre.toUpperCase());
            renderTechTable(`body-${targetArray}`, gestionData[targetArray], role, targetArray);
        }
    }

    cerrarModalAgregar();
    showNotification('Agregado correctamente', 'success');
};

window.eliminarItemCatalogo = function(type, index) {
    if(confirm('¿Eliminar este elemento del catálogo?')) {
        gestionData[type].splice(index, 1);
        const role = JSON.parse(localStorage.getItem('sesion')).rol.toLowerCase();
        renderTechTable(`body-${type}`, gestionData[type], role, type);
    }
};

// --- CORE FUNCIONES DASHBOARD ---
function inicializarFechas() {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    const inputInicio = document.getElementById('fecha-inicio');
    const inputFin = document.getElementById('fecha-fin');
    if(inputInicio) inputInicio.value = hace30Dias.toISOString().split('T')[0];
    if(inputFin) inputFin.value = hoy.toISOString().split('T')[0];
}

function actualizarTabla(tickets) {
    const tbody = document.getElementById('tickets-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    if (tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Sin resultados</td></tr>';
        return;
    }
    
    tickets.forEach(ticket => {
        tbody.innerHTML += `
            <tr>
                <td>${ticket.tecnico}</td>
                <td>${ticket.fecha}</td>
                <td><span class="empresa-badge">${ticket.empresa}</span></td>
                <td>${ticket.tiempo}</td>
                <td>${ticket.tipoFalla}</td>
                <td><span class="status-badge status-${ticket.estado}">${ticket.estadoTexto}</span></td>
                <td>
                    <select class="status-select" onchange="cambiarEstadoTicket(${ticket.id}, this.value)">
                        <option value="abierto" ${ticket.estado==='abierto'?'selected':''}>Abierto</option>
                        <option value="espera" ${ticket.estado==='espera'?'selected':''}>En Espera</option>
                        <option value="cerrado" ${ticket.estado==='cerrado'?'selected':''}>Cerrado</option>
                        <option value="resuelto" ${ticket.estado==='resuelto'?'selected':''}>Resuelto</option>
                    </select>
                </td>
            </tr>
        `;
    });
}

window.cambiarEstadoTicket = function(id, nuevoEstado) {
    const ticket = ticketsData.find(t => t.id === id);
    if(ticket) {
        ticket.estado = nuevoEstado;
        ticket.estadoTexto = nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1);
        actualizarVista();
        showNotification('Estado actualizado', 'success');
    }
};

function actualizarEstadisticas(tickets) {
    document.getElementById('total-incidencias').textContent = tickets.length;
    document.getElementById('abiertas-count').textContent = tickets.filter(t=>t.estado==='abierto').length;
    document.getElementById('espera-count').textContent = tickets.filter(t=>t.estado==='espera').length;
    document.getElementById('cerradas-count').textContent = tickets.filter(t=>t.estado==='cerrado'||t.estado==='resuelto').length;
    
    if(document.getElementById('active-tecnicos-count'))
        document.getElementById('active-tecnicos-count').textContent = tecnicosDB.filter(t=>t.activo).length;
    if(document.getElementById('active-empresas-count'))
        document.getElementById('active-empresas-count').textContent = empresasDB.filter(e=>e.activo).length;
}

function inicializarEventos() {
    const btnLimpiar = document.getElementById('limpiar-filtros');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function() {
            document.getElementById('empresa').value = '';
            document.getElementById('tecnico').value = '';
            document.getElementById('tipo-falla').value = '';
            document.getElementById('estado').value = '';
            inicializarFechas();
            actualizarVista();
            showNotification('Filtros limpiados', 'success');
        });
    }
    document.querySelectorAll('.filter-control').forEach(input => {
        if(!input.id.includes('agregar')) input.addEventListener('change', actualizarVista);
    });
}

function actualizarVista() {
    const filtros = obtenerFiltros();
    if (!filtros) return;
    const ticketsFiltrados = filtrarTickets(filtros);
    actualizarTabla(ticketsFiltrados);
    actualizarEstadisticas(ticketsFiltrados);
}

function obtenerFiltros() {
    const emp = document.getElementById('empresa');
    if(!emp) return null;
    return {
        empresa: emp.value,
        tecnico: document.getElementById('tecnico').value,
        tipoFalla: document.getElementById('tipo-falla').value,
        estado: document.getElementById('estado').value,
        fechaInicio: document.getElementById('fecha-inicio').value,
        fechaFin: document.getElementById('fecha-fin').value
    };
}

function filtrarTickets(filtros) {
    return ticketsData.filter(ticket => {
        if (filtros.empresa && !ticket.empresa.toLowerCase().includes(filtros.empresa.toLowerCase())) return false;
        if (filtros.tecnico) {
            const tecnicoKey = ticket.tecnico.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const filtroNormalizado = filtros.tecnico.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (!tecnicoKey.includes(filtroNormalizado)) return false;
        }
        if (filtros.tipoFalla && !ticket.tipoFalla.toLowerCase().includes(filtros.tipoFalla.toLowerCase())) return false;
        if (filtros.estado && ticket.estado !== filtros.estado) return false;
        return true;
    });
}

function renderAllIncidencias() {
    const tbody = document.getElementById('all-tickets-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    ticketsData.forEach(t => {
        tbody.innerHTML += `<tr><td>#${t.id}</td><td>${t.tecnico}</td><td>${t.empresa}</td><td>${t.tipoFalla}</td><td>${t.fecha}</td><td>${t.estadoTexto}</td></tr>`;
    });
}

function showNotification(msg, type) {
    const n = document.createElement('div');
    n.style.cssText = `position:fixed;top:20px;right:20px;padding:15px;border-radius:8px;color:white;font-weight:600;z-index:9999;background:${type==='success'?'#AB096A':'#3498db'};box-shadow:0 4px 10px rgba(0,0,0,0.2);animation:fadeIn 0.5s;`;
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(()=>n.remove(), 3000);
}