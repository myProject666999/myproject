import pymysql

db_config = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'charset': 'utf8mb4',
    'database': 'vehicle_parking'
}

new_hash = '$2a$10$82xY7zJL1q8eqgyZ6Z5Yve6wtenocZRLZs73MCYy6.9NoiBHq1cAW'

try:
    conn = pymysql.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute("UPDATE users SET password = %s WHERE username = 'admin'", (new_hash,))
    conn.commit()

    cursor.execute("SELECT id, username, password FROM users WHERE username = 'admin'")
    row = cursor.fetchone()
    print(f"Updated user: id={row[0]}, username={row[1]}")
    print(f"New password hash: {row[2]}")

    cursor.close()
    conn.close()
    print("Password updated successfully.")

except Exception as e:
    print(f"Error: {e}")
