$base = "http://127.0.0.1:8080/api"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$results = [System.Collections.ArrayList]@()

function Test-API($name, $method, $path, $body = $null) {
  try {
    if ($body) {
      $resp = Invoke-RestMethod -Uri ($base + $path) -Method $method -Body ($body | ConvertTo-Json -Depth 6) -ContentType "application/json" -WebSession $session
    } else {
      $resp = Invoke-RestMethod -Uri ($base + $path) -Method $method -WebSession $session
    }
    $ok = ($resp.code -eq 200)
    $msg = if ($resp.message) { $resp.message } else { "" }
    [void]$results.Add([pscustomobject]@{ Name = $name; OK = $ok; Code = $resp.code; Msg = $msg })
    Write-Host "$name : $(if($ok){'PASS'}else{'FAIL'}) code=$($resp.code) msg=$msg"
    return $resp
  } catch {
    [void]$results.Add([pscustomobject]@{ Name = $name; OK = $false; Code = 0; Msg = $_.Exception.Message })
    Write-Host "$name : ERROR $($_.Exception.Message)"
    return $null
  }
}

Write-Host "=== 1. 获取桌台列表 ==="
Test-API "获取所有桌台" GET "/tables"

Write-Host "=== 2. 绑定桌台 ==="
Test-API "绑定桌台A01" POST "/tables/bind/A01"

Write-Host "=== 3. 获取分类和菜品 ==="
Test-API "获取分类" GET "/dishes/categories"
$dishesResp = Test-API "获取所有菜品" GET "/dishes"

$dish1 = $dishesResp.data[0]
$dish2 = $dishesResp.data[1]
Write-Host "dish1: $($dish1.name) ($($dish1.id)) dish2: $($dish2.name) ($($dish2.id))"

Write-Host "=== 4. 添加购物车 ==="
Test-API "添加菜品1到购物车" POST "/cart/add?dishId=$($dish1.id)&quantity=2"
Test-API "添加菜品2到购物车" POST "/cart/add?dishId=$($dish2.id)&quantity=1"
Test-API "获取购物车" GET "/cart"

Write-Host "=== 5. 下单 ==="
$tableResp = Test-API "获取当前桌台" GET "/tables/current"
$tableId = $tableResp.data.id
Write-Host "当前桌台ID=$tableId 桌号=$($tableResp.data.tableNo)"

$items = @(
  @{ dishId = $dish1.id; quantity = 2 },
  @{ dishId = $dish2.id; quantity = 1 }
)
$orderResp = Test-API "创建订单" POST "/orders" @{ tableId = $tableId; items = $items; remark = "测试订单" }
$orderId = $orderResp.data.id
Write-Host "订单ID=$orderId 订单号=$($orderResp.data.orderNo)"

Write-Host "=== 6. 查询订单 ==="
Test-API "按ID查询订单" GET "/orders/$orderId"
Test-API "按桌台查询订单" GET "/orders/table/$tableId"
Test-API "查询活跃订单" GET "/orders/active"
Test-API "按状态查询" GET "/orders/status?statuses=PENDING"

Write-Host "=== 7. 确认订单 ==="
Test-API "确认订单" PUT "/orders/$orderId/confirm"

Write-Host "=== 8. 开始制作 ==="
$orderDetail = Test-API "查询订单详情" GET "/orders/$orderId"
$orderItems = $orderDetail.data.items
Test-API "开始制作菜品1" PUT "/orders/item/$($orderItems[0].id)/cook"
Test-API "开始制作菜品2" PUT "/orders/item/$($orderItems[1].id)/cook"

Write-Host "=== 9. 出餐 ==="
Test-API "出餐菜品1" PUT "/orders/item/$($orderItems[0].id)/serve"
Test-API "出餐菜品2" PUT "/orders/item/$($orderItems[1].id)/serve"

Write-Host "=== 10. 完成订单 ==="
Test-API "完成订单" PUT "/orders/$orderId/complete"

Write-Host "=== 11. 支付订单 ==="
Test-API "支付订单" PUT "/orders/$orderId/pay"

Write-Host "=== 12. 测试取消流程 ==="
$items2 = @(@{ dishId = $dish1.id; quantity = 1 })
$order2Resp = Test-API "创建订单2" POST "/orders" @{ tableId = $tableId; items = $items2 }
$order2Id = $order2Resp.data.id
Test-API "取消订单" PUT "/orders/$order2Id/cancel"

Write-Host "=== 13. 管理后台测试 ==="
Test-API "获取所有菜品(管理)" GET "/dishes"
Test-API "获取所有桌台" GET "/tables"
Test-API "获取所有分类(管理)" GET "/dishes/categories?all=true"

$newCat = Test-API "创建新分类" POST "/dishes/categories" @{ name = "测试分类"; icon = "test"; sortOrder = 99; status = 1 }
$catId = $newCat.data.id
Test-API "修改分类" PUT "/dishes/categories/$catId" @{ name = "测试分类修改"; icon = "test2"; sortOrder = 88; status = 1 }
Test-API "删除分类" DELETE "/dishes/categories/$catId"

Write-Host ""
Write-Host "======== 测试结果汇总 ========"
$passed = ($results | Where-Object { $_.OK }).Count
$failed = ($results | Where-Object { -not $_.OK }).Count
Write-Host "共 $($results.Count) 项测试：通过 $passed 项，失败 $failed 项"
if ($failed -gt 0) {
  Write-Host "失败列表:"
  $results | Where-Object { -not $_.OK } | ForEach-Object { Write-Host "  - $($_.Name): $($_.Msg)" }
}
