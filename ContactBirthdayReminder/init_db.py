import mysql.connector
from mysql.connector import Error

def init_database():
    try:
        connection = mysql.connector.connect(
            host='127.0.0.1',
            port=3306,
            user='root',
            password='123456'
        )
        
        if connection.is_connected():
            print('成功连接到MySQL服务器')
            
            cursor = connection.cursor()
            
            with open('sql/birthday_reminder.sql', 'r', encoding='utf-8') as f:
                sql_script = f.read()
            
            for statement in sql_script.split(';'):
                statement = statement.strip()
                if statement:
                    try:
                        cursor.execute(statement)
                        print(f'执行SQL成功: {statement[:50]}...')
                    except Error as e:
                        print(f'执行SQL警告: {e}')
            
            connection.commit()
            print('\n数据库初始化完成！')
            print('数据库名: birthday_reminder')
            print('已创建表: user, contact, reminder_setting, greeting_card')
            print('已插入测试数据: 1个用户, 3个贺卡模板')
            
    except Error as e:
        print(f'数据库连接错误: {e}')
        print('\n请检查:')
        print('1. MySQL服务是否已启动')
        print('2. 端口3306是否正确')
        print('3. 用户名root和密码123456是否正确')
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print('MySQL连接已关闭')

if __name__ == '__main__':
    init_database()
