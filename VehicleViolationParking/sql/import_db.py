import pymysql
import sys
import os

db_config = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'charset': 'utf8mb4'
}

sql_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vehicle_parking.sql')

try:
    conn = pymysql.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute("CREATE DATABASE IF NOT EXISTS `vehicle_parking` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    conn.commit()
    print("Database vehicle_parking created/verified.")

    cursor.execute("USE `vehicle_parking`")

    with open(sql_file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    statements = sql_content.split(';')
    for stmt in statements:
        stmt = stmt.strip()
        if not stmt or stmt.startswith('--') or 'CREATE DATABASE' in stmt.upper() or 'USE `' in stmt:
            continue
        try:
            cursor.execute(stmt)
            conn.commit()
        except Exception as e:
            print(f"Warning - SQL error: {e}")
            print(f"Statement: {stmt[:120]}...")
            conn.rollback()

    cursor.execute("SHOW TABLES FROM vehicle_parking")
    tables = cursor.fetchall()
    print("\nSuccessfully imported. Tables:")
    for table in tables:
        print(f"  - {table[0]}")

    print("\nData counts:")
    for table in tables:
        tname = table[0]
        try:
            cursor.execute(f"SELECT COUNT(*) FROM `{tname}`")
            count = cursor.fetchone()[0]
            print(f"  {tname}: {count} rows")
        except:
            pass

    cursor.close()
    conn.close()
    print("\nDone.")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
