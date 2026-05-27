Write-Host "========================================" -ForegroundColor Cyan
Write-Host "安装 Google Chrome 浏览器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromePath) {
    Write-Host "Chrome 已安装: $chromePath" -ForegroundColor Green
    exit 0
}

$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (Test-Path $edgePath) {
    Write-Host "Edge 已安装: $edgePath" -ForegroundColor Green
    Write-Host "系统将使用 Edge 浏览器进行转换" -ForegroundColor Yellow
    exit 0
}

$installerUrl = "https://dl.google.com/chrome/install/latest/chrome_installer.exe"
$installerPath = "$env:TEMP\chrome_installer.exe"

Write-Host "下载 Chrome 安装程序..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
} catch {
    Write-Host "下载失败，尝试使用 winget 安装..." -ForegroundColor Yellow
    try {
        winget install --id Google.Chrome -e --source winget
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Chrome 安装成功！" -ForegroundColor Green
        } else {
            Write-Host "winget 安装失败" -ForegroundColor Red
        }
    } catch {
        Write-Host "安装失败，请手动下载 Chrome:" -ForegroundColor Red
        Write-Host "https://www.google.com/chrome/" -ForegroundColor Blue
    }
    exit 1
}

Write-Host "安装 Chrome..." -ForegroundColor Yellow
Start-Process -FilePath $installerPath -ArgumentList "/silent", "/install" -Wait

if (Test-Path $chromePath) {
    Write-Host "Chrome 安装成功！" -ForegroundColor Green
} else {
    Write-Host "安装可能未完成，请检查" -ForegroundColor Red
}

Remove-Item $installerPath -ErrorAction SilentlyContinue
