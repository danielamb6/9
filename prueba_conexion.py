import psycopg2

print("--- INICIANDO PRUEBA DE CONEXIÓN ---")

# 1. PEGA AQUÍ TU CADENA DE CONEXIÓN EXACTA DE NEON
# Asegúrate de que sea la más reciente (si cambiaste la contraseña, usa la nueva)
DB_URI = 'postgresql://neondb_owner:npg_LOQTwP86bvYc@ep-floral-meadow-ahobjrmx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

try:
    # Intentamos conectar
    print(f"Intentando conectar a: {DB_URI.split('@')[1]}") # Muestra solo la parte del servidor por seguridad
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    # 2. HACEMOS LA CONSULTA DE PRUEBA (Un simple "Hola")
    print("Conexión establecida. Ejecutando consulta de prueba...")
    cur.execute('SELECT version();')
    version = cur.fetchone()[0]
    
    print("\n✅ ¡ÉXITO! LA CONEXIÓN FUNCIONA PERFECTAMENTE.")
    print(f"Tu base de datos es: {version}")
    
    cur.close()
    conn.close()

except Exception as e:
    print("\n❌ FALLÓ LA CONEXIÓN. Aquí está el error exacto:")
    print("------------------------------------------------")
    print(e)
    print("------------------------------------------------")
    print("CONSEJO: Si dice 'password authentication failed', tu contraseña en el código es antigua o incorrecta.")