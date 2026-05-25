import pymysql

db_config = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'charset': 'utf8mb4',
    'database': 'vehicle_parking'
}

try:
    conn = pymysql.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO `users` (`username`, `password`, `real_name`, `role`, `status`) "
            "VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 1, 1)"
        )
        print("Inserted admin user.")

    cursor.execute("SELECT COUNT(*) FROM billing_rules")
    if cursor.fetchone()[0] == 0:
        billing_rules = [
            ("小型车标准计费", 1, 5.00, 30, 3.00, 30, 50.00, 15, 300.00, 100, 1),
            ("中型车标准计费", 2, 8.00, 30, 5.00, 30, 80.00, 15, 500.00, 90, 1),
            ("大型车标准计费", 3, 12.00, 30, 8.00, 30, 120.00, 15, 800.00, 80, 1),
        ]
        cursor.executemany(
            "INSERT INTO `billing_rules` (`rule_name`, `vehicle_type`, `base_fee`, `base_duration`, `unit_fee`, `unit_duration`, `max_fee`, `free_duration`, `monthly_fee`, `priority`, `status`) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            billing_rules
        )
        print("Inserted billing rules.")

    cursor.execute("SELECT COUNT(*) FROM parking_spots")
    if cursor.fetchone()[0] == 0:
        spots = []
        for i in range(1, 21):
            spots.append((f"A{i:03d}", 1, "A区", 0))
        for i in range(1, 21):
            spots.append((f"B{i:03d}", 1, "B区", 0))
        for i in range(1, 11):
            spots.append((f"C{i:03d}", 2, "C区", 0))
        for i in range(1, 11):
            spots.append((f"D{i:03d}", 3, "D区", 0))
        cursor.executemany(
            "INSERT INTO `parking_spots` (`spot_number`, `spot_type`, `spot_area`, `status`) VALUES (%s, %s, %s, %s)",
            spots
        )
        print(f"Inserted {len(spots)} parking spots.")

    conn.commit()

    print("\nVerification:")
    for table in ['users', 'billing_rules', 'parking_spots', 'vehicles', 'access_records', 'monthly_cards', 'payments']:
        cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
        count = cursor.fetchone()[0]
        print(f"  {table}: {count} rows")

    cursor.close()
    conn.close()
    print("\nInit data done.")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
