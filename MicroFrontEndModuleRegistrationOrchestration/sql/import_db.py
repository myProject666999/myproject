import pymysql
import os

db_config = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'charset': 'utf8mb4'
}

sql_file_path = os.path.join(os.path.dirname(__file__), 'micro_frontend.sql')

try:
    print("正在连接MySQL数据库...")
    conn = pymysql.connect(**db_config)
    cursor = conn.cursor()
    print("数据库连接成功！")

    print("正在读取SQL脚本...")
    with open(sql_file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    print("正在执行SQL脚本...")
    sql_statements = []
    current_statement = []
    in_comment = False
    in_string = False
    string_char = None

    for line in sql_content.split('\n'):
        stripped_line = line.strip()

        if stripped_line.startswith('--') or stripped_line.startswith('#'):
            continue

        if stripped_line.startswith('/*') and '*/' not in stripped_line:
            in_comment = True
            continue
        if '*/' in stripped_line and in_comment:
            in_comment = False
            continue
        if in_comment:
            continue

        i = 0
        while i < len(line):
            char = line[i]
            if char in ("'", '"', '`'):
                if not in_string:
                    in_string = True
                    string_char = char
                elif char == string_char:
                    in_string = False
                    string_char = None
            elif char == ';' and not in_string:
                current_statement.append(line[:i + 1])
                full_statement = ''.join(current_statement).strip()
                if full_statement:
                    sql_statements.append(full_statement)
                current_statement = [line[i + 1:]]
                break
            i += 1
        else:
            current_statement.append(line + '\n')

    if current_statement:
        full_statement = ''.join(current_statement).strip()
        if full_statement and not full_statement.startswith('--'):
            sql_statements.append(full_statement)

    print(f"共解析到 {len(sql_statements)} 条SQL语句")

    success_count = 0
    error_count = 0

    for i, sql in enumerate(sql_statements, 1):
        try:
            cursor.execute(sql)
            success_count += 1
            if i % 10 == 0:
                print(f"已执行 {i}/{len(sql_statements)} 条语句...")
        except Exception as e:
            error_count += 1
            print(f"第 {i} 条语句执行失败: {str(e)}")
            print(f"SQL内容: {sql[:200]}...")

    conn.commit()

    print("\n" + "=" * 60)
    print(f"执行完成！成功: {success_count} 条，失败: {error_count} 条")
    print("=" * 60)

    cursor.execute("USE `micro_frontend`")
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"\n数据库 `micro_frontend` 包含 {len(tables)} 张表:")
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM `{table[0]}`")
        count = cursor.fetchone()[0]
        print(f"  - {table[0]}: {count} 条记录")

    cursor.close()
    conn.close()
    print("\n数据库连接已关闭")

except Exception as e:
    print(f"发生错误: {str(e)}")
    import traceback
    traceback.print_exc()
