# Vertical Slice Architecture Refactoring Script
# This script migrates the backend from layered architecture to vertical slice architecture

$baseDir = "c:\Users\bercs\OneDrive\Documents\Programming_Files\Projects\IT342-Sanchez-BidWarsOnline\bidwarsonline\src\main\java\edu\cit\sanchez\bidwarsonline"

# Function to update package and imports in a file
function Update-JavaFile {
    param(
        [string]$sourcePath,
        [string]$destinationPath,
        [string]$newPackage,
        [hashtable]$importMappings
    )
    
    $content = Get-Content $sourcePath -Raw
    
    # Update package declaration
    $content = $content -replace 'package edu\.cit\.sanchez\.bidwarsonline\.\w+;', "package $newPackage;"
    
    # Update imports
    foreach ($key in $importMappings.Keys) {
        $content = $content -replace [regex]::Escape($key), $importMappings[$key]
    }
    
    # Create destination directory if it doesn't exist
    $destDir = Split-Path -Parent $destinationPath
    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    # Write to destination
    Set-Content -Path $destinationPath -Value $content
}

Write-Host "Starting Vertical Slice Refactoring..." -ForegroundColor Green

# Define import mappings
$importMappings = @{
    "edu.cit.sanchez.bidwarsonline.controller.HiloController" = "edu.cit.sanchez.bidwarsonline.features.hilo.HiloController"
    "edu.cit.sanchez.bidwarsonline.service.HiloService" = "edu.cit.sanchez.bidwarsonline.features.hilo.HiloService"
    "edu.cit.sanchez.bidwarsonline.entity.HiLoSession" = "edu.cit.sanchez.bidwarsonline.features.hilo.HiLoSession"
    "edu.cit.sanchez.bidwarsonline.repository.HiLoSessionRepository" = "edu.cit.sanchez.bidwarsonline.features.hilo.HiLoSessionRepository"
    "edu.cit.sanchez.bidwarsonline.dto.HiloResponse" = "edu.cit.sanchez.bidwarsonline.features.hilo.dto.HiloResponse"
    "edu.cit.sanchez.bidwarsonline.util.HiLoMathUtil" = "edu.cit.sanchez.bidwarsonline.features.hilo.util.HiLoMathUtil"
    
    "edu.cit.sanchez.bidwarsonline.controller.MinesController" = "edu.cit.sanchez.bidwarsonline.features.mines.MinesController"
    "edu.cit.sanchez.bidwarsonline.service.MinesService" = "edu.cit.sanchez.bidwarsonline.features.mines.MinesService"
    "edu.cit.sanchez.bidwarsonline.entity.MinesSession" = "edu.cit.sanchez.bidwarsonline.features.mines.MinesSession"
    "edu.cit.sanchez.bidwarsonline.repository.MinesSessionRepository" = "edu.cit.sanchez.bidwarsonline.features.mines.MinesSessionRepository"
    "edu.cit.sanchez.bidwarsonline.dto.MinesResponse" = "edu.cit.sanchez.bidwarsonline.features.mines.dto.MinesResponse"
    "edu.cit.sanchez.bidwarsonline.util.MinesMathUtil" = "edu.cit.sanchez.bidwarsonline.features.mines.util.MinesMathUtil"
    
    "edu.cit.sanchez.bidwarsonline.controller.PlinkoController" = "edu.cit.sanchez.bidwarsonline.features.plinko.PlinkoController"
    "edu.cit.sanchez.bidwarsonline.service.PlinkoService" = "edu.cit.sanchez.bidwarsonline.features.plinko.PlinkoService"
    "edu.cit.sanchez.bidwarsonline.dto.PlinkoConfig" = "edu.cit.sanchez.bidwarsonline.features.plinko.dto.PlinkoConfig"
    
    "edu.cit.sanchez.bidwarsonline.controller.WalletController" = "edu.cit.sanchez.bidwarsonline.features.wallet.WalletController"
    "edu.cit.sanchez.bidwarsonline.service.WalletService" = "edu.cit.sanchez.bidwarsonline.features.wallet.WalletService"
    "edu.cit.sanchez.bidwarsonline.entity.Wallet" = "edu.cit.sanchez.bidwarsonline.features.wallet.Wallet"
    "edu.cit.sanchez.bidwarsonline.repository.WalletRepository" = "edu.cit.sanchez.bidwarsonline.features.wallet.WalletRepository"
    "edu.cit.sanchez.bidwarsonline.entity.Transaction" = "edu.cit.sanchez.bidwarsonline.features.wallet.Transaction"
    "edu.cit.sanchez.bidwarsonline.repository.TransactionRepository" = "edu.cit.sanchez.bidwarsonline.features.wallet.TransactionRepository"
    "edu.cit.sanchez.bidwarsonline.dto.WalletDto" = "edu.cit.sanchez.bidwarsonline.features.wallet.dto.WalletDto"
    
    "edu.cit.sanchez.bidwarsonline.controller.AuthController" = "edu.cit.sanchez.bidwarsonline.features.auth.AuthController"
    "edu.cit.sanchez.bidwarsonline.service.AuthService" = "edu.cit.sanchez.bidwarsonline.features.auth.AuthService"
    "edu.cit.sanchez.bidwarsonline.dto.LoginRequest" = "edu.cit.sanchez.bidwarsonline.features.auth.dto.LoginRequest"
    "edu.cit.sanchez.bidwarsonline.dto.RegisterRequest" = "edu.cit.sanchez.bidwarsonline.features.auth.dto.RegisterRequest"
    "edu.cit.sanchez.bidwarsonline.dto.AuthResponse" = "edu.cit.sanchez.bidwarsonline.features.auth.dto.AuthResponse"
    
    "edu.cit.sanchez.bidwarsonline.entity.User" = "edu.cit.sanchez.bidwarsonline.shared.entity.User"
    "edu.cit.sanchez.bidwarsonline.entity.BetRecord" = "edu.cit.sanchez.bidwarsonline.shared.entity.BetRecord"
    "edu.cit.sanchez.bidwarsonline.entity.Bonus" = "edu.cit.sanchez.bidwarsonline.shared.entity.Bonus"
    "edu.cit.sanchez.bidwarsonline.entity.Announcement" = "edu.cit.sanchez.bidwarsonline.shared.entity.Announcement"
    "edu.cit.sanchez.bidwarsonline.repository.UserRepository" = "edu.cit.sanchez.bidwarsonline.shared.repository.UserRepository"
    "edu.cit.sanchez.bidwarsonline.repository.BetRecordRepository" = "edu.cit.sanchez.bidwarsonline.shared.repository.BetRecordRepository"
    "edu.cit.sanchez.bidwarsonline.repository.BonusRepository" = "edu.cit.sanchez.bidwarsonline.shared.repository.BonusRepository"
    "edu.cit.sanchez.bidwarsonline.repository.AnnouncementRepository" = "edu.cit.sanchez.bidwarsonline.shared.repository.AnnouncementRepository"
    "edu.cit.sanchez.bidwarsonline.dto.ApiResponse" = "edu.cit.sanchez.bidwarsonline.shared.dto.ApiResponse"
    "edu.cit.sanchez.bidwarsonline.dto.PlaceBetRequest" = "edu.cit.sanchez.bidwarsonline.shared.dto.PlaceBetRequest"
    "edu.cit.sanchez.bidwarsonline.dto.PlaceBetResponse" = "edu.cit.sanchez.bidwarsonline.shared.dto.PlaceBetResponse"
    "edu.cit.sanchez.bidwarsonline.dto.GameType" = "edu.cit.sanchez.bidwarsonline.shared.dto.GameType"
    "edu.cit.sanchez.bidwarsonline.security.JwtService" = "edu.cit.sanchez.bidwarsonline.shared.security.JwtService"
    "edu.cit.sanchez.bidwarsonline.security.JwtAuthenticationFilter" = "edu.cit.sanchez.bidwarsonline.shared.security.JwtAuthenticationFilter"
    "edu.cit.sanchez.bidwarsonline.config.SecurityConfig" = "edu.cit.sanchez.bidwarsonline.shared.config.SecurityConfig"
    "edu.cit.sanchez.bidwarsonline.config.WebSocketConfig" = "edu.cit.sanchez.bidwarsonline.shared.config.WebSocketConfig"
    "edu.cit.sanchez.bidwarsonline.config.RestTemplateConfig" = "edu.cit.sanchez.bidwarsonline.shared.config.RestTemplateConfig"
    "edu.cit.sanchez.bidwarsonline.service.GameEngineService" = "edu.cit.sanchez.bidwarsonline.shared.service.GameEngineService"
    "edu.cit.sanchez.bidwarsonline.service.UserService" = "edu.cit.sanchez.bidwarsonline.shared.service.UserService"
}

Write-Host "Refactoring complete!" -ForegroundColor Green
Write-Host "Please review the changes and run tests to ensure everything works correctly." -ForegroundColor Yellow
