import pymysql
import os

sql_file_path = os.path.join(os.path.dirname(__file__), 'diary.sql')

with open(sql_file_path, 'r', encoding='utf-8') as f:
    sql_content = f.read()

statements = []
current_statement = []
in_comment = False

for line in sql_content.split('\n'):
    stripped = line.strip()
    if not stripped or stripped.startswith('--'):
        continue
    if stripped.startswith('/*'):
        in_comment = True
        continue
    if stripped.endswith('*/'):
        in_comment = False
        continue
    if in_comment:
        continue
    current_statement.append(line)
    if stripped.endswith(';'):
        statement = '\n'.join(current_statement)
        statements.append(statement)
        current_statement = []

if current_statement:
    statements.append('\n'.join(current_statement))

try:
    conn = pymysql.connect(
        host='127.0.0.1',
        port=3306,
        user='root',
        password='123456',
        charset='utf8mb4'
    )
    cursor = conn.cursor()

    for statement in statements:
        statement = statement.strip()
        if statement:
            try:
                cursor.execute(statement)
                conn.commit()
                print(f"执行成功: {statement[:80]}...")
            except Exception as e:
                print(f"执行失败: {statement[:80]}...")
                print(f"错误: {e}")
                conn.rollback()

    cursor.close()
    conn.close()
    print("\n数据库导入完成！")

except Exception as e:
    print(f"连接数据库失败: {e}")
