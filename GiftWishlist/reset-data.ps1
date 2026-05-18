# 重置测试数据脚本 - 通过API接口插入正确的中文数据

$baseUrl = "http://localhost:8080/api"

# 先删除现有数据（通过删除数据库重新初始化）
# 由于没有删除API，我们直接使用注册API创建新用户，然后创建数据

# 1. 创建用户
$users = @(
    @{ username = "alice"; nickname = "爱丽丝"; birthday = "1995-06-15"; password = "123456" },
    @{ username = "bob"; nickname = "鲍勃"; birthday = "1994-08-20"; password = "123456" },
    @{ username = "charlie"; nickname = "查理"; birthday = "1996-03-10"; password = "123456" }
)

$createdUsers = @{}
foreach ($user in $users) {
    $body = $user | ConvertTo-Json
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/users/register" -Method Post -Body $body -ContentType "application/json;charset=utf-8"
        $result = $response.Content | ConvertFrom-Json
        if ($result.code -eq 200) {
            $createdUsers[$user.username] = $result.data
            Write-Host "创建用户成功: $($user.username) - $($user.nickname)"
        } else {
            Write-Host "用户已存在: $($user.username)"
            # 尝试登录获取用户ID
            $loginBody = @{ username = $user.username; password = $user.password } | ConvertTo-Json
            $loginResponse = Invoke-WebRequest -Uri "$baseUrl/users/login" -Method Post -Body $loginBody -ContentType "application/json;charset=utf-8"
            $loginResult = $loginResponse.Content | ConvertFrom-Json
            if ($loginResult.code -eq 200) {
                $createdUsers[$user.username] = $loginResult.data
                Write-Host "获取用户信息成功: $($user.username) - ID: $($loginResult.data.id)"
            }
        }
    } catch {
        Write-Host "处理用户 $($user.username) 失败: $_"
    }
}

# 2. 获取用户ID
$aliceId = $createdUsers["alice"].id
$bobId = $createdUsers["bob"].id
$charlieId = $createdUsers["charlie"].id

Write-Host "用户ID: Alice=$aliceId, Bob=$bobId, Charlie=$charlieId"

# 3. 创建心愿单
$wishlists = @(
    @{ userId = $aliceId; title = "生日礼物"; description = "希望收到的生日礼物"; isPublic = 1 },
    @{ userId = $aliceId; title = "圣诞礼物"; description = "圣诞心愿清单"; isPublic = 1 },
    @{ userId = $bobId; title = "生日愿望"; description = "今年的生日愿望"; isPublic = 1 }
)

$createdWishlists = @()
foreach ($wl in $wishlists) {
    $body = $wl | ConvertTo-Json
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/wishlists" -Method Post -Body $body -ContentType "application/json;charset=utf-8"
        $result = $response.Content | ConvertFrom-Json
        if ($result.code -eq 200) {
            $createdWishlists += $result.data
            Write-Host "创建心愿单成功: $($wl.title)"
        }
    } catch {
        Write-Host "创建心愿单失败 $($wl.title): $_"
    }
}

# 4. 创建商品
$wishlist1Id = $createdWishlists[0].id
$wishlist2Id = $createdWishlists[1].id
$wishlist3Id = $createdWishlists[2].id

$items = @(
    @{ wishlistId = $wishlist1Id; title = "AirPods Pro"; description = "降噪耳机"; url = "https://www.apple.com/airpods-pro/"; price = 1999.00; priority = 2 },
    @{ wishlistId = $wishlist1Id; title = "机械键盘"; description = "Cherry轴机械键盘"; url = "https://www.cherrymx.de/"; price = 899.00; priority = 1 },
    @{ wishlistId = $wishlist2Id; title = "旅行背包"; description = "大容量旅行背包"; price = 599.00; priority = 2 },
    @{ wishlistId = $wishlist3Id; title = "游戏手柄"; description = "PS5游戏手柄"; price = 499.00; priority = 1 }
)

$createdItems = @()
foreach ($item in $items) {
    $body = $item | ConvertTo-Json
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/items" -Method Post -Body $body -ContentType "application/json;charset=utf-8"
        $result = $response.Content | ConvertFrom-Json
        if ($result.code -eq 200) {
            $createdItems += $result.data
            Write-Host "创建商品成功: $($item.title)"
        }
    } catch {
        Write-Host "创建商品失败 $($item.title): $_"
    }
}

# 5. 添加好友关系
$friendships = @(
    @{ userId = $aliceId; friendId = $bobId },
    @{ userId = $bobId; friendId = $aliceId },
    @{ userId = $aliceId; friendId = $charlieId },
    @{ userId = $charlieId; friendId = $aliceId }
)

foreach ($fs in $friendships) {
    $body = $fs | ConvertTo-Json
    try {
        Invoke-WebRequest -Uri "$baseUrl/friendships" -Method Post -Body $body -ContentType "application/json;charset=utf-8" | Out-Null
        Write-Host "添加好友关系: $($fs.userId) -> $($fs.friendId)"
    } catch {
        Write-Host "添加好友关系失败: $_"
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "测试数据重置完成！"
Write-Host "测试账号:"
Write-Host "  alice / 123456 (爱丽丝)"
Write-Host "  bob / 123456 (鲍勃)"
Write-Host "  charlie / 123456 (查理)"
Write-Host "========================================"
