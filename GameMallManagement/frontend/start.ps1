Remove-Item Env:HOST -ErrorAction SilentlyContinue
Remove-Item Env:PORT -ErrorAction SilentlyContinue
Remove-Item Env:ALLOWED_HOSTS -ErrorAction SilentlyContinue
Remove-Item Env:WDS_SOCKET_HOST -ErrorAction SilentlyContinue
Remove-Item Env:WDS_SOCKET_PORT -ErrorAction SilentlyContinue

npx react-scripts start
