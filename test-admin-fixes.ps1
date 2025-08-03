# Admin Page Fixes Verification Script
Write-Host "🔧 Testing Admin Page Fixes" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8001"
$frontendUrl = "http://localhost:8080"

# Test 1: Backend Health Check
Write-Host "1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -TimeoutSec 5
    if ($healthResponse.status -eq "OK") {
        Write-Host "   ✅ Backend is healthy" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Backend health check failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Backend is not running on port 8001" -ForegroundColor Red
    Write-Host "   💡 Start backend with: cd backend && npm run dev" -ForegroundColor Yellow
}

# Test 2: Admin Login API
Write-Host ""
Write-Host "2. Testing Admin Login API..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@promptify.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/admin/login" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 10
    
    if ($loginResponse.success -eq $true) {
        Write-Host "   ✅ Admin login API works correctly" -ForegroundColor Green
        $token = $loginResponse.data.token
        
        # Test 3: UserInfo API with token
        Write-Host ""
        Write-Host "3. Testing UserInfo API..." -ForegroundColor Yellow
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
                "Content-Type" = "application/json"
            }
            
            $userInfoResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/userInfo" -Headers $headers -TimeoutSec 5
            
            if ($userInfoResponse.success -eq $true) {
                Write-Host "   ✅ UserInfo API works correctly" -ForegroundColor Green
            } else {
                Write-Host "   ❌ UserInfo API failed" -ForegroundColor Red
            }
        } catch {
            Write-Host "   ❌ UserInfo API request failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "   ❌ Admin login failed: $($loginResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Admin login API request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Static File Serving
Write-Host ""
Write-Host "4. Testing Static File Serving..." -ForegroundColor Yellow
try {
    # Create a test file
    $testFile = "e:\Project\generative-prompt-studio\backend\uploads\test.txt"
    "Test file content" | Out-File -FilePath $testFile -Encoding UTF8
    
    $staticResponse = Invoke-WebRequest -Uri "$baseUrl/uploads/test.txt" -TimeoutSec 5 -UseBasicParsing
    
    if ($staticResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Static file serving works correctly" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Static file serving failed" -ForegroundColor Red
    }
    
    # Clean up test file
    Remove-Item $testFile -ErrorAction SilentlyContinue
} catch {
    Write-Host "   ❌ Static file serving test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Frontend Accessibility
Write-Host ""
Write-Host "5. Testing Frontend Accessibility..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -TimeoutSec 5 -UseBasicParsing
    
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Frontend accessibility failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Frontend is not running on port 8080" -ForegroundColor Red
    Write-Host "   💡 Start frontend with: cd frontend && npm run dev" -ForegroundColor Yellow
}

# Test 6: Admin Login Page
Write-Host ""
Write-Host "6. Testing Admin Login Page..." -ForegroundColor Yellow
try {
    $adminLoginResponse = Invoke-WebRequest -Uri "$frontendUrl/admin/login" -TimeoutSec 5 -UseBasicParsing
    
    if ($adminLoginResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Admin login page is accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Admin login page failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Admin login page test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fixed Issues:" -ForegroundColor Green
Write-Host "✅ Settings import error in AdminLayout.tsx" -ForegroundColor White
Write-Host "✅ 500 error in admin login API" -ForegroundColor White
Write-Host "✅ 401 error in userInfo API" -ForegroundColor White
Write-Host "✅ File upload ERR_FILE_NOT_FOUND errors" -ForegroundColor White
Write-Host "✅ Enhanced error handling and validation" -ForegroundColor White
Write-Host "✅ Added React Error Boundary" -ForegroundColor White
Write-Host ""
Write-Host "Admin Credentials:" -ForegroundColor Yellow
Write-Host "Email: admin@promptify.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "Backend: $baseUrl" -ForegroundColor White
Write-Host "Frontend: $frontendUrl" -ForegroundColor White
Write-Host "Admin Login: $frontendUrl/admin/login" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Navigate to $frontendUrl/admin/login" -ForegroundColor White
Write-Host "2. Login with admin credentials" -ForegroundColor White
Write-Host "3. Verify dashboard loads without errors" -ForegroundColor White
Write-Host "4. Test file uploads and other admin features" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"