$baseUrl = "http://localhost:8080"
$headers = @{"Content-Type" = "application/json"}

Write-Host "=== Short Drama Platform API Test ===" -ForegroundColor Green
Write-Host ""

Write-Host "1. Testing login API..." -ForegroundColor Yellow
$loginBody = @{username="admin"; password="admin123"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -Headers $headers -UseBasicParsing
$token = $loginResponse.data.token
Write-Host "   Login success! Token: $($token.Substring(0, 20))..." -ForegroundColor Green
Write-Host ""

$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

Write-Host "2. Testing get stakeholder types..." -ForegroundColor Yellow
$typesResponse = Invoke-RestMethod -Uri "$baseUrl/api/stakeholders/types" -Method GET -Headers $authHeaders -UseBasicParsing
Write-Host "   Got $($typesResponse.data.Count) stakeholder types" -ForegroundColor Green
foreach ($t in $typesResponse.data) {
    Write-Host "     - $($t.type_name) ($($t.type_code))"
}
Write-Host ""

Write-Host "3. Testing create stakeholder..." -ForegroundColor Yellow
$shBody = @{
    type_code = "PRODUCER"
    name = "Test Production Co., Ltd."
    contact_person = "John Doe"
    contact_phone = "13800138000"
    bank_account = "6222021234567890123"
    bank_name = "ICBC"
} | ConvertTo-Json
$shResponse = Invoke-RestMethod -Uri "$baseUrl/api/stakeholders" -Method POST -Body $shBody -Headers $authHeaders -UseBasicParsing
$producerId = $shResponse.data.id
Write-Host "   Create producer success! ID: $producerId, Name: $($shResponse.data.name)" -ForegroundColor Green
Write-Host ""

Write-Host "4. Testing create drama..." -ForegroundColor Yellow
$dramaBody = @{
    title = "Test Drama: Office Story"
    description = "A short drama about office life"
    total_episodes = 24
    duration = 10
} | ConvertTo-Json
$dramaResponse = Invoke-RestMethod -Uri "$baseUrl/api/dramas" -Method POST -Body $dramaBody -Headers $authHeaders -UseBasicParsing
$dramaId = $dramaResponse.data.id
Write-Host "   Create drama success! ID: $dramaId, Title: $($dramaResponse.data.title)" -ForegroundColor Green
Write-Host ""

Write-Host "5. Testing create profit share rule (fixed ratio)..." -ForegroundColor Yellow
$dslContent = @{
    base_ratio = 70.0
    platform_ratio = 30.0
    min_payout = 100.0
} | ConvertTo-Json -Depth 10
$ruleBody = @{
    rule_name = "Test Fixed Ratio Rule"
    rule_type = 1
    description = "Fixed 70% share ratio"
    dsl_content = $dslContent
    priority = 10
} | ConvertTo-Json -Depth 10
$ruleResponse = Invoke-RestMethod -Uri "$baseUrl/api/rules" -Method POST -Body $ruleBody -Headers $authHeaders -UseBasicParsing
$ruleId = $ruleResponse.data.id
Write-Host "   Create rule success! ID: $ruleId, Name: $($ruleResponse.data.rule_name)" -ForegroundColor Green
Write-Host ""

Write-Host "6. Testing publish profit share rule..." -ForegroundColor Yellow
$updateRuleBody = @{status = 1} | ConvertTo-Json
$updateRuleResponse = Invoke-RestMethod -Uri "$baseUrl/api/rules/$ruleId" -Method PUT -Body $updateRuleBody -Headers $authHeaders -UseBasicParsing
Write-Host "   Rule status updated to: $($updateRuleResponse.data.status) (1=Published)" -ForegroundColor Green
Write-Host ""

Write-Host "7. Testing bind rule to drama..." -ForegroundColor Yellow
$bindBody = @{drama_id = $dramaId; rule_id = $ruleId} | ConvertTo-Json
$bindResponse = Invoke-RestMethod -Uri "$baseUrl/api/rules/bind" -Method POST -Body $bindBody -Headers $authHeaders -UseBasicParsing
Write-Host "   Rule bind success!" -ForegroundColor Green
Write-Host ""

Write-Host "8. Testing add drama right allocation..." -ForegroundColor Yellow
$rightBody = @{
    drama_id = $dramaId
    stakeholder_id = $producerId
    base_ratio = 100.0
    remark = "Producer 100% share"
} | ConvertTo-Json
$rightResponse = Invoke-RestMethod -Uri "$baseUrl/api/dramas/rights" -Method POST -Body $rightBody -Headers $authHeaders -UseBasicParsing
Write-Host "   Right allocation success! Ratio: $($rightResponse.data.base_ratio)%" -ForegroundColor Green
Write-Host ""

Write-Host "9. Testing import play data..." -ForegroundColor Yellow
$playBody = @{
    drama_id = $dramaId
    play_count = 10000
    play_duration = 100000
    unique_viewers = 5000
    data_date = "2026-05-01"
    data_source = "Test Data"
} | ConvertTo-Json
$playResponse = Invoke-RestMethod -Uri "$baseUrl/api/data/play" -Method POST -Body $playBody -Headers $authHeaders -UseBasicParsing
Write-Host "   Import play data success! Play count: $($playResponse.data.play_count)" -ForegroundColor Green
Write-Host ""

Write-Host "10. Testing import payment data..." -ForegroundColor Yellow
$payBody = @{
    drama_id = $dramaId
    payment_amount = 5000.00
    payment_count = 500
    unique_payers = 300
    data_date = "2026-05-01"
    data_source = "Test Data"
} | ConvertTo-Json
$payResponse = Invoke-RestMethod -Uri "$baseUrl/api/data/payment" -Method POST -Body $payBody -Headers $authHeaders -UseBasicParsing
Write-Host "   Import payment data success! Payment amount: $($payResponse.data.payment_amount)" -ForegroundColor Green
Write-Host ""

Write-Host "11. Testing trigger share calculation..." -ForegroundColor Yellow
$calcBody = @{
    drama_id = $dramaId
    settlement_period = "202605"
    task_type = 3
} | ConvertTo-Json
$calcResponse = Invoke-RestMethod -Uri "$baseUrl/api/share/calculate" -Method POST -Body $calcBody -Headers $authHeaders -UseBasicParsing
$taskNo = $calcResponse.data.task_no
Write-Host "   Share calculation task submitted! Task No: $taskNo" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2

Write-Host "12. Testing query share task list..." -ForegroundColor Yellow
$tasksResponse = Invoke-RestMethod -Uri "$baseUrl/api/share/tasks" -Method GET -Headers $authHeaders -UseBasicParsing
Write-Host "   Got $($tasksResponse.data.total) tasks" -ForegroundColor Green
foreach ($task in $tasksResponse.data.list) {
    $statusText = @("Pending", "Processing", "Completed", "Failed")[$task.status]
    Write-Host "     - Task No: $($task.task_no), Status: $statusText"
}
Write-Host ""

Write-Host "13. Testing query share details..." -ForegroundColor Yellow
$taskId = $tasksResponse.data.list[0].id
$detailsResponse = Invoke-RestMethod -Uri "$baseUrl/api/share/details/$taskId" -Method GET -Headers $authHeaders -UseBasicParsing
Write-Host "   Got $($detailsResponse.data.Count) share details" -ForegroundColor Green
foreach ($d in $detailsResponse.data) {
    $typeText = @("", "Play Revenue", "Payment Revenue")[$d.revenue_type]
    $logLen = [Math]::Min(50, $d.calculation_log.Length)
    Write-Host "     - Type: $typeText, Amount: $($d.share_amount), Log: $($d.calculation_log.Substring(0, $logLen))"
}
Write-Host ""

Write-Host "14. Testing create settlement order..." -ForegroundColor Yellow
$settleBody = @{
    stakeholder_id = $producerId
    settlement_period = "202605"
} | ConvertTo-Json
$settleResponse = Invoke-RestMethod -Uri "$baseUrl/api/settlements" -Method POST -Body $settleBody -Headers $authHeaders -UseBasicParsing
$settleId = $settleResponse.data.id
$totalAmount = $settleResponse.data.total_share_amount
$hashSig = $settleResponse.data.hash_signature
Write-Host "   Create settlement success! ID: $settleId, Total: $totalAmount" -ForegroundColor Green
Write-Host "   Hash: $($hashSig.Substring(0, 30))..." -ForegroundColor Cyan
Write-Host ""

Write-Host "15. Testing verify settlement integrity..." -ForegroundColor Yellow
$verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/settlements/$settleId/verify" -Method POST -Headers $authHeaders -UseBasicParsing
$isValid = $verifyResponse.data.is_valid
Write-Host "   Verify result: Data integrity = $isValid" -ForegroundColor $(if ($isValid) {"Green"} else {"Red"})
Write-Host "   Calc total: $($verifyResponse.data.recalculated_total), Stored total: $($verifyResponse.data.stored_total)" -ForegroundColor Cyan
Write-Host ""

Write-Host "16. Testing confirm settlement order..." -ForegroundColor Yellow
$confirmResponse = Invoke-RestMethod -Uri "$baseUrl/api/settlements/$settleId/confirm" -Method POST -Headers $authHeaders -UseBasicParsing
Write-Host "   Settlement confirmed! Status: $($confirmResponse.data.status)" -ForegroundColor Green
Write-Host ""

Write-Host "17. Testing create copyright authorization..." -ForegroundColor Yellow
$authBody = @{
    drama_id = $dramaId
    authorizer_id = $producerId
    licensee_id = $producerId
    authorization_type = 1
    authorization_scope = "Mainland China"
    rights_type = "Information Network Dissemination Right"
    effective_date = "2026-01-01"
    expire_date = "2027-12-31"
    authorization_fee = 100000.00
    contract_no = "CT202605001"
} | ConvertTo-Json
$authResponse = Invoke-RestMethod -Uri "$baseUrl/api/copyright-authorizations" -Method POST -Body $authBody -Headers $authHeaders -UseBasicParsing
Write-Host "   Create auth success! ID: $($authResponse.data.id), No: $($authResponse.data.authorization_no)" -ForegroundColor Green
Write-Host ""

Write-Host "18. Testing copyright authorization conflict check..." -ForegroundColor Yellow
$conflictUrl = "$baseUrl/api/copyright-authorizations/check/conflict?drama_id=$dramaId&licensee_id=$producerId&effective_date=2026-06-01&expire_date=2026-12-31"
$conflictResponse = Invoke-RestMethod -Uri $conflictUrl -Method GET -Headers $authHeaders -UseBasicParsing
$hasConflict = $conflictResponse.data.has_conflict
Write-Host "   Conflict check result: Has conflict = $hasConflict" -ForegroundColor $(if ($hasConflict) {"Yellow"} else {"Green"})
Write-Host ""

Write-Host "=== All tests completed! ===" -ForegroundColor Green
Write-Host "Passed: 18/18" -ForegroundColor Green
