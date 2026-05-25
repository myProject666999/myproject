import requests
import json

base = 'http://127.0.0.1:8080/api'

login_res = requests.post(base + '/auth/login', json={'username': 'admin', 'password': '123456'})
print('Login response:', login_res.text)

if login_res.status_code != 200:
    print('Login failed!')
    exit(1)

token = login_res.json()['data']['token']
headers = {'Authorization': 'Bearer ' + token}

print('\n=== 测试新增车辆 ===')
vehicle_data = {
    'plate_number': '京A12345',
    'vehicle_type': 1,
    'owner_name': '张三',
    'owner_phone': '13800138000',
    'card_type': 2,
    'card_expire_time': '2026-05-31',
    'remark': '测试车辆'
}
print('请求数据:', json.dumps(vehicle_data, indent=2))
res = requests.post(base + '/vehicles', json=vehicle_data, headers=headers)
print('响应:', json.dumps(res.json(), indent=2, ensure_ascii=False))

print('\n=== 测试新增车位 ===')
spot_data = {
    'spot_number': 'E001',
    'spot_type': 1,
    'spot_area': 'E区',
    'status': 0,
    'remark': '测试车位'
}
print('请求数据:', json.dumps(spot_data, indent=2))
res = requests.post(base + '/spots', json=spot_data, headers=headers)
print('响应:', json.dumps(res.json(), indent=2, ensure_ascii=False))
