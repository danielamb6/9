from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import datetime
import os
import bcrypt

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN BD ---
DB_URI = 'postgresql://neondb_owner:npg_LOQTwP86bvYc@ep-floral-meadow-ahobjrmx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
REPORTES_DIR = 'reportes_generados'

if not os.path.exists(REPORTES_DIR):
    os.makedirs(REPORTES_DIR)

def get_db_connection():
    try:
        conn = psycopg2.connect(DB_URI)
        return conn
    except Exception as e:
        print(f"❌ Error DB Connection: {e}")
        return None

@app.route('/', methods=['GET'])
def index():
    return "API de Gestión de Tickets - Servidor en Ejecución"

# ==========================================
# 1. TICKETS Y DASHBOARD
# ==========================================
@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Error conexión BD"}), 500
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT 
                t.id, t.num_autobus, t.estado, t.fecha_creacion, 
                fr.falla as falla_descripcion,
                sol.solucion as ficha_solucion, 
                CONCAT(tec.nombre, ' ', tec.primer_apellido) as tecnico_nombre,
                CONCAT(c.nombre, ' ', c.primer_apellido) as cliente, 
                e.empresa as empresa_nombre
            FROM tickets t
            LEFT JOIN falla_reportada fr ON t.id_falla_reportada = fr.id
            LEFT JOIN cliente c ON t.id_clientes = c.id
            LEFT JOIN empresas e ON c.id_empresa = e.id
            LEFT JOIN fichas_tecnicas ft ON t.id = ft.id_ticket
            LEFT JOIN solucion sol ON ft.id_solucion = sol.id
            LEFT JOIN tecnicos tec ON ft.id_tecnico = tec.id
            ORDER BY t.fecha_creacion DESC
        """
        cur.execute(query)
        data = cur.fetchall()
        for item in data:
            if item.get('fecha_creacion'): 
                item['fecha_creacion'] = item['fecha_creacion'].strftime('%Y-%m-%d')
            else: 
                item['fecha_creacion'] = "---"
        return jsonify(data)
    except Exception as e: 
        print(f"Error Tickets: {e}")
        return jsonify({"error": str(e)}), 500
    finally: conn.close()

@app.route('/api/tickets/<int:id>/estado', methods=['PUT'])
def cambiar_estado_ticket(id):
    data = request.json
    nuevo_estado = data.get('estado')
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE tickets SET estado = %s WHERE id = %s", (nuevo_estado, id))
        conn.commit()
        return jsonify({"message": "Estado actualizado"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: conn.close()

# ==========================================
# 2. CATÁLOGOS
# ==========================================
@app.route('/api/catalogos/<tabla>', methods=['GET', 'POST'])
def gestionar_catalogos(tabla):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    config = {
        'empresas':         {'t': 'empresas',         'c': 'empresa'},
        'equipo':           {'t': 'equipo',           'c': 'equipo'},
        'cat_elementos':    {'t': 'cat_elementos',    'c': 'elemento'},
        'accesorios':       {'t': 'accesorios',       'c': 'accesorios'},
        'detalle_revision': {'t': 'detalle_revision', 'c': 'descripcion'},
        'solucion':         {'t': 'solucion',         'c': 'solucion'},
        'falla_reportada':  {'t': 'falla_reportada',  'c': 'falla'}
    }
    
    if tabla == 'detalle_revision': config['detalle_revision']['c'] = 'descripcion'
    if tabla == 'solucion': config['solucion']['c'] = 'solucion'

    if tabla not in config: 
        return jsonify({"error": f"Tabla '{tabla}' no válida"}), 400
    
    t = config[tabla]['t']
    c = config[tabla]['c']
    
    try:
        if request.method == 'GET':
            cur.execute(f'SELECT id, "{c}" as descripcion FROM "{t}" ORDER BY id DESC')
            return jsonify(cur.fetchall())
            
        elif request.method == 'POST':
            valor = request.json.get('valor')
            if not valor: return jsonify({"error": "Valor vacío"}), 400
            cur.execute(f'INSERT INTO "{t}" ("{c}") VALUES (%s)', (valor,))
            conn.commit()
            return jsonify({"message": "Agregado correctamente"}), 201
            
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: conn.close()

@app.route('/api/catalogos/<tabla>/<int:id>', methods=['DELETE'])
def eliminar_catalogo(tabla, id):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        mapa_tablas = {
            'empresas': 'empresas', 'equipo': 'equipo', 'cat_elementos': 'cat_elementos',
            'accesorios': 'accesorios', 'detalle_revision': 'detalle_revision',
            'solucion': 'solucion', 'falla_reportada': 'falla_reportada'
        }
        if tabla in mapa_tablas:
            t_real = mapa_tablas[tabla]
            cur.execute(f'DELETE FROM "{t_real}" WHERE id = %s', (id,))
            conn.commit()
            return jsonify({"message": "Eliminado"}), 200
        return jsonify({"error": "Tabla no permitida"}), 400
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: conn.close()

# ==========================================
# 3. TÉCNICOS Y CLIENTES
# ==========================================
@app.route('/api/tecnicos', methods=['GET'])
def get_tecnicos():
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT t.id, t.nombre, t.primer_apellido, t.activo, e.especialidad 
            FROM tecnicos t 
            LEFT JOIN especialidad e ON t.id_especialidad = e.id 
            ORDER BY t.id
        """
        cur.execute(query)
        return jsonify(cur.fetchall())
    finally: conn.close()

@app.route('/api/clientes', methods=['GET'])
def get_clientes():
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT c.id, c.nombre, c.primer_apellido, c.activo, e.empresa 
            FROM cliente c 
            LEFT JOIN empresas e ON c.id_empresa = e.id 
            ORDER BY c.id
        """
        cur.execute(query)
        return jsonify(cur.fetchall())
    finally: conn.close()

@app.route('/api/<tipo>/<int:id>/toggle', methods=['PUT'])
def toggle_estado(tipo, id):
    if tipo == 'admin': tabla = 'admin'
    elif tipo == 'tecnicos': tabla = 'tecnicos'
    else: tabla = 'cliente'
        
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(f"UPDATE {tabla} SET activo = NOT activo WHERE id = %s", (id,))
        conn.commit()
        return jsonify({"message": "OK"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: conn.close()

# ==========================================
# 4. GESTIÓN DE USUARIOS (ADMIN)
# ==========================================
@app.route('/api/admin', methods=['GET', 'POST'])
def gestion_usuarios():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Error conexión BD"}), 500
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        if request.method == 'GET':
            cur.execute("SELECT id, nombre, primer_apellido, usuario, correo, rol, activo FROM admin ORDER BY id DESC")
            return jsonify(cur.fetchall())
        
        if request.method == 'POST':
            data = request.json
            partes = data.get('nombre', '').split(' ', 1)
            nombre = partes[0]
            apellido = partes[1] if len(partes) > 1 else ''
            
            password_raw = data.get('password')
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password_raw.encode('utf-8'), salt).decode('utf-8')

            query = """
                INSERT INTO admin (nombre, primer_apellido, correo, rol, usuario, contrasena, activo)
                VALUES (%s, %s, %s, %s, %s, %s, TRUE)
            """
            cur.execute(query, (nombre, apellido, data.get('email'), data.get('rol'), data.get('username'), hashed_password))
            conn.commit()
            return jsonify({"message": "Usuario creado"}), 201

    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: conn.close()

@app.route('/api/admin/<int:id>/estado', methods=['PUT'])
def toggle_admin_estado(id):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE admin SET activo = NOT activo WHERE id = %s", (id,))
        conn.commit()
        return jsonify({"message": "Estado actualizado"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    usuario = data.get('username')
    password = data.get('password')
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM admin WHERE (usuario=%s OR correo=%s) AND activo=TRUE", (usuario, usuario))
        user = cur.fetchone()
        
        if user:
            db_pass = user['contrasena']
            if db_pass.startswith('$2'):
                if bcrypt.checkpw(password.encode('utf-8'), db_pass.encode('utf-8')):
                    user.pop('contrasena', None) 
                    return jsonify({"message": "OK", "usuario": user}), 200
            elif db_pass == password:
                 user.pop('contrasena', None)
                 return jsonify({"message": "OK", "usuario": user}), 200
                 
        return jsonify({"error": "Credenciales inválidas"}), 401
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: conn.close()

# ==========================================
# 5. REPORTES AVANZADOS (ACTUALIZADO)
# ==========================================
@app.route('/api/reportes/generar', methods=['POST'])
def generar_reporte():
    filtros = request.json
    f_ini = filtros.get('fecha_ini')
    f_fin = filtros.get('fecha_fin')
    empresa = filtros.get('empresa')
    estado = filtros.get('estado')
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Error BD"}), 500
    
    response_data = {
        "tickets_stats": {}, "tickets_lista": [], 
        "fichas_stats": {}, "refacciones_stats": {},
        "extra_stats": {}
    }
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # 1. SECCIÓN TICKETS
        where_clauses = []
        params = []
        if f_ini: where_clauses.append("t.fecha_creacion >= %s"); params.append(f_ini)
        if f_fin: where_clauses.append("t.fecha_creacion <= %s"); params.append(f_fin)
        if estado: where_clauses.append("t.estado = %s"); params.append(estado)
        if empresa: where_clauses.append("e.empresa = %s"); params.append(empresa)
            
        where_str = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        cur.execute(f"""
            SELECT t.estado, COUNT(*) as total FROM tickets t
            LEFT JOIN cliente c ON t.id_clientes = c.id
            LEFT JOIN empresas e ON c.id_empresa = e.id
            {where_str} GROUP BY t.estado
        """, tuple(params))
        response_data['tickets_stats'] = cur.fetchall()

        cur.execute(f"""
            SELECT t.id, t.num_autobus, t.fecha_creacion, t.estado, e.empresa, CONCAT(c.nombre, ' ', c.primer_apellido) as cliente
            FROM tickets t
            LEFT JOIN cliente c ON t.id_clientes = c.id
            LEFT JOIN empresas e ON c.id_empresa = e.id
            {where_str} ORDER BY t.fecha_creacion DESC
        """, tuple(params))
        tickets = cur.fetchall()
        for t in tickets: t['fecha_creacion'] = str(t['fecha_creacion'])
        response_data['tickets_lista'] = tickets

        # 2. SECCIÓN FICHA TÉCNICA
        cur.execute("""
            SELECT eq.equipo, COUNT(*) as fallas 
            FROM tickets t
            JOIN falla_reportada fr ON t.id_falla_reportada = fr.id
            JOIN equipo eq ON fr.id_equipo = eq.id
            GROUP BY eq.equipo 
            ORDER BY fallas DESC LIMIT 5
        """)
        response_data['fichas_stats']['top_equipos'] = cur.fetchall()

        cur.execute("""
            SELECT fr.falla, COUNT(*) as cantidad
            FROM tickets t
            JOIN falla_reportada fr ON t.id_falla_reportada = fr.id
            GROUP BY fr.falla
            ORDER BY cantidad DESC LIMIT 10
        """)
        response_data['fichas_stats']['top_fallas'] = cur.fetchall()

        # NUEVO: Calcular HORAS para la gráfica (EXTRACT EPOCH para Postgres)
        cur.execute("""
            SELECT 
                t.id, 
                t.fecha_creacion, 
                ft.fecha_cierre, 
                (ft.fecha_cierre - t.fecha_creacion) as duracion,
                EXTRACT(EPOCH FROM (ft.fecha_cierre - t.fecha_creacion))/3600 as horas_aprox
            FROM tickets t JOIN fichas_tecnicas ft ON t.id = ft.id_ticket
            WHERE t.estado = 'RESUELTO' AND ft.fecha_cierre IS NOT NULL
            ORDER BY t.id DESC LIMIT 10
        """)
        tiempos = cur.fetchall()
        for t in tiempos:
            t['fecha_creacion'] = str(t['fecha_creacion'])
            t['fecha_cierre'] = str(t['fecha_cierre'])
            t['duracion'] = str(t['duracion'])
            # horas_aprox queda como float
        response_data['fichas_stats']['tiempos_resolucion'] = tiempos

        cur.execute("SELECT COUNT(*) as total FROM reporte_extra")
        total_extra = cur.fetchone()['total']
        cur.execute("SELECT id, observacion FROM reporte_extra ORDER BY id DESC LIMIT 10")
        lista_extra = cur.fetchall()
        response_data['extra_stats'] = {'total': total_extra, 'lista': lista_extra}

        # 3. SECCIÓN REFACCIONES
        try:
            cur.execute("""
                SELECT 
                    CASE WHEN fecha_cierre IS NOT NULL THEN 'CERRADO' ELSE 'ABIERTO' END as estado,
                    COUNT(*) as total 
                FROM reporte_refaccion GROUP BY estado
            """)
            response_data['refacciones_stats']['estatus'] = cur.fetchall()
            
            cur.execute("""
                SELECT id, (fecha_cierre - fecha_inicio) as tiempo 
                FROM reporte_refaccion 
                WHERE fecha_cierre IS NOT NULL
                LIMIT 10
            """)
            tiempos_ref = cur.fetchall()
            for r in tiempos_ref: r['tiempo'] = str(r['tiempo'])
            response_data['refacciones_stats']['tiempos'] = tiempos_ref
            
            cur.execute("SELECT COUNT(*) as total FROM reporte_refaccion")
            response_data['refacciones_stats']['total_global'] = cur.fetchone()['total']
            
        except Exception as e:
            response_data['refacciones_stats']['estatus'] = []

        return jsonify(response_data)

    except Exception as e:
        print(f"Error Reportes: {e}")
        return jsonify({"error": str(e)}), 500
    finally: conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)