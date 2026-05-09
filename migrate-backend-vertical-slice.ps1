# Comprehensive Vertical Slice Migration Script
# This script automates the migration of all files from layered to vertical slice architecture

$baseDir = "c:\Users\bercs\OneDrive\Documents\Programming_Files\Projects\IT342-Sanchez-BidWarsOnline\bidwarsonline\src\main\java\edu\cit\sanchez\bidwarsonline"

Write-Host "Starting comprehensive vertical slice migration..." -ForegroundColor Cyan

# Create a function to copy and update files
function Copy-AndUpdateJavaFile {
    param(
        [string]$sourceFile,
        [string]$destFile,
        [string]$newPackage
    )
    
    if (!(Test-Path $sourceFile)) {
        Write-Host "Warning: Source file not found: $sourceFile" -ForegroundColor Yellow
        return
    }
    
    $content = Get-Content $sourceFile -Raw
    
    # Update package declaration
    $content = $content -replace 'package edu\.cit\.sanchez\.bidwarsonline\.\w+;', "package $newPackage;"
    
    # Update all imports with new package structure
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.controller\.(.*?);', 'import edu.cit.sanchez.bidwarsonline.features.*.$1;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.service\.HiloService;', 'import edu.cit.sanchez.bidwarsonline.features.hilo.HiloService;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.service\.MinesService;', 'import edu.cit.sanchez.bidwarsonline.features.mines.MinesService;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.service\.PlinkoService;', 'import edu.cit.sanchez.bidwarsonline.features.plinko.PlinkoService;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.service\.WalletService;', 'import edu.cit.sanchez.bidwarsonline.features.wallet.WalletService;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.service\.AuthService;', 'import edu.cit.sanchez.bidwarsonline.features.auth.AuthService;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.service\.GameEngineService;', 'import edu.cit.sanchez.bidwarsonline.shared.service.GameEngineService;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.service\.UserService;', 'import edu.cit.sanchez.bidwarsonline.shared.service.UserService;'
    
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.entity\.User;', 'import edu.cit.sanchez.bidwarsonline.shared.entity.User;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.entity\.Wallet;', 'import edu.cit.sanchez.bidwarsonline.features.wallet.Wallet;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.entity\.Transaction;', 'import edu.cit.sanchez.bidwarsonline.features.wallet.Transaction;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.entity\.BetRecord;', 'import edu.cit.sanchez.bidwarsonline.shared.entity.BetRecord;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.entity\.Bonus;', 'import edu.cit.sanchez.bidwarsonline.shared.entity.Bonus;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.entity\.Announcement;', 'import edu.cit.sanchez.bidwarsonline.shared.entity.Announcement;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.entity\.HiLoSession;', 'import edu.cit.sanchez.bidwarsonline.features.hilo.HiLoSession;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.entity\.MinesSession;', 'import edu.cit.sanchez.bidwarsonline.features.mines.MinesSession;'
    
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.repository\.UserRepository;', 'import edu.cit.sanchez.bidwarsonline.shared.repository.UserRepository;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.repository\.WalletRepository;', 'import edu.cit.sanchez.bidwarsonline.features.wallet.WalletRepository;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.repository\.TransactionRepository;', 'import edu.cit.sanchez.bidwarsonline.features.wallet.TransactionRepository;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.repository\.BetRecordRepository;', 'import edu.cit.sanchez.bidwarsonline.shared.repository.BetRecordRepository;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.repository\.BonusRepository;', 'import edu.cit.sanchez.bidwarsonline.shared.repository.BonusRepository;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.repository\.AnnouncementRepository;', 'import edu.cit.sanchez.bidwarsonline.shared.repository.AnnouncementRepository;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.repository\.HiLoSessionRepository;', 'import edu.cit.sanchez.bidwarsonline.features.hilo.HiLoSessionRepository;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.repository\.MinesSessionRepository;', 'import edu.cit.sanchez.bidwarsonline.features.mines.MinesSessionRepository;'
    
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.ApiResponse;', 'import edu.cit.sanchez.bidwarsonline.shared.dto.ApiResponse;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.PlaceBetRequest;', 'import edu.cit.sanchez.bidwarsonline.shared.dto.PlaceBetRequest;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.PlaceBetResponse;', 'import edu.cit.sanchez.bidwarsonline.shared.dto.PlaceBetResponse;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.GameType;', 'import edu.cit.sanchez.bidwarsonline.shared.dto.GameType;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.HiloResponse;', 'import edu.cit.sanchez.bidwarsonline.features.hilo.dto.HiloResponse;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.MinesResponse;', 'import edu.cit.sanchez.bidwarsonline.features.mines.dto.MinesResponse;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.PlinkoConfig;', 'import edu.cit.sanchez.bidwarsonline.features.plinko.dto.PlinkoConfig;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.WalletDto;', 'import edu.cit.sanchez.bidwarsonline.features.wallet.dto.WalletDto;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.LoginRequest;', 'import edu.cit.sanchez.bidwarsonline.features.auth.dto.LoginRequest;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.RegisterRequest;', 'import edu.cit.sanchez.bidwarsonline.features.auth.dto.RegisterRequest;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.dto\.AuthResponse;', 'import edu.cit.sanchez.bidwarsonline.features.auth.dto.AuthResponse;'
    
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.util\.HiLoMathUtil;', 'import edu.cit.sanchez.bidwarsonline.features.hilo.util.HiLoMathUtil;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.util\.MinesMathUtil;', 'import edu.cit.sanchez.bidwarsonline.features.mines.util.MinesMathUtil;'
    
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.security\.JwtService;', 'import edu.cit.sanchez.bidwarsonline.shared.security.JwtService;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.security\.JwtAuthenticationFilter;', 'import edu.cit.sanchez.bidwarsonline.shared.security.JwtAuthenticationFilter;'
    
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.config\.SecurityConfig;', 'import edu.cit.sanchez.bidwarsonline.shared.config.SecurityConfig;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.config\.WebSocketConfig;', 'import edu.cit.sanchez.bidwarsonline.shared.config.WebSocketConfig;'
    $content = $content -replace 'import edu\.cit\.sanchez\.bidwarsonline\.config\.RestTemplateConfig;', 'import edu.cit.sanchez.bidwarsonline.shared.config.RestTemplateConfig;'
    
    # Create destination directory
    $destDir = Split-Path -Parent $destFile
    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    # Write the updated content
    Set-Content -Path $destFile -Value $content -Encoding UTF8
    Write-Host "  ✓ Migrated: $destFile" -ForegroundColor Green
}

# Migrate shared entities
Write-Host "`nMigrating shared entities..." -ForegroundColor Cyan
Copy-AndUpdateJavaFile "$baseDir\entity\User.java" "$baseDir\shared\entity\User.java" "edu.cit.sanchez.bidwarsonline.shared.entity"
Copy-AndUpdateJavaFile "$baseDir\entity\BetRecord.java" "$baseDir\shared\entity\BetRecord.java" "edu.cit.sanchez.bidwarsonline.shared.entity"
Copy-AndUpdateJavaFile "$baseDir\entity\Bonus.java" "$baseDir\shared\entity\Bonus.java" "edu.cit.sanchez.bidwarsonline.shared.entity"
Copy-AndUpdateJavaFile "$baseDir\entity\Announcement.java" "$baseDir\shared\entity\Announcement.java" "edu.cit.sanchez.bidwarsonline.shared.entity"

# Migrate wallet feature
Write-Host "`nMigrating wallet feature..." -ForegroundColor Cyan
Copy-AndUpdateJavaFile "$baseDir\entity\Wallet.java" "$baseDir\features\wallet\Wallet.java" "edu.cit.sanchez.bidwarsonline.features.wallet"
Copy-AndUpdateJavaFile "$baseDir\entity\Transaction.java" "$baseDir\features\wallet\Transaction.java" "edu.cit.sanchez.bidwarsonline.features.wallet"
Copy-AndUpdateJavaFile "$baseDir\repository\WalletRepository.java" "$baseDir\features\wallet\WalletRepository.java" "edu.cit.sanchez.bidwarsonline.features.wallet"
Copy-AndUpdateJavaFile "$baseDir\repository\TransactionRepository.java" "$baseDir\features\wallet\TransactionRepository.java" "edu.cit.sanchez.bidwarsonline.features.wallet"
Copy-AndUpdateJavaFile "$baseDir\controller\WalletController.java" "$baseDir\features\wallet\WalletController.java" "edu.cit.sanchez.bidwarsonline.features.wallet"
Copy-AndUpdateJavaFile "$baseDir\service\WalletService.java" "$baseDir\features\wallet\WalletService.java" "edu.cit.sanchez.bidwarsonline.features.wallet"
Copy-AndUpdateJavaFile "$baseDir\dto\WalletDto.java" "$baseDir\features\wallet\dto\WalletDto.java" "edu.cit.sanchez.bidwarsonline.features.wallet.dto"

# Migrate mines feature
Write-Host "`nMigrating mines feature..." -ForegroundColor Cyan
Copy-AndUpdateJavaFile "$baseDir\entity\MinesSession.java" "$baseDir\features\mines\MinesSession.java" "edu.cit.sanchez.bidwarsonline.features.mines"
Copy-AndUpdateJavaFile "$baseDir\repository\MinesSessionRepository.java" "$baseDir\features\mines\MinesSessionRepository.java" "edu.cit.sanchez.bidwarsonline.features.mines"
Copy-AndUpdateJavaFile "$baseDir\controller\MinesController.java" "$baseDir\features\mines\MinesController.java" "edu.cit.sanchez.bidwarsonline.features.mines"
Copy-AndUpdateJavaFile "$baseDir\service\MinesService.java" "$baseDir\features\mines\MinesService.java" "edu.cit.sanchez.bidwarsonline.features.mines"
Copy-AndUpdateJavaFile "$baseDir\dto\MinesResponse.java" "$baseDir\features\mines\dto\MinesResponse.java" "edu.cit.sanchez.bidwarsonline.features.mines.dto"
Copy-AndUpdateJavaFile "$baseDir\util\MinesMathUtil.java" "$baseDir\features\mines\util\MinesMathUtil.java" "edu.cit.sanchez.bidwarsonline.features.mines.util"

# Migrate plinko feature
Write-Host "`nMigrating plinko feature..." -ForegroundColor Cyan
Copy-AndUpdateJavaFile "$baseDir\controller\PlinkoController.java" "$baseDir\features\plinko\PlinkoController.java" "edu.cit.sanchez.bidwarsonline.features.plinko"
Copy-AndUpdateJavaFile "$baseDir\service\PlinkoService.java" "$baseDir\features\plinko\PlinkoService.java" "edu.cit.sanchez.bidwarsonline.features.plinko"
Copy-AndUpdateJavaFile "$baseDir\dto\PlinkoConfig.java" "$baseDir\features\plinko\dto\PlinkoConfig.java" "edu.cit.sanchez.bidwarsonline.features.plinko.dto"

# Migrate auth feature
Write-Host "`nMigrating auth feature..." -ForegroundColor Cyan
Copy-AndUpdateJavaFile "$baseDir\controller\AuthController.java" "$baseDir\features\auth\AuthController.java" "edu.cit.sanchez.bidwarsonline.features.auth"
Copy-AndUpdateJavaFile "$baseDir\service\AuthService.java" "$baseDir\features\auth\AuthService.java" "edu.cit.sanchez.bidwarsonline.features.auth"
Copy-AndUpdateJavaFile "$baseDir\dto\LoginRequest.java" "$baseDir\features\auth\dto\LoginRequest.java" "edu.cit.sanchez.bidwarsonline.features.auth.dto"
Copy-AndUpdateJavaFile "$baseDir\dto\RegisterRequest.java" "$baseDir\features\auth\dto\RegisterRequest.java" "edu.cit.sanchez.bidwarsonline.features.auth.dto"
Copy-AndUpdateJavaFile "$baseDir\dto\AuthResponse.java" "$baseDir\features\auth\dto\AuthResponse.java" "edu.cit.sanchez.bidwarsonline.features.auth.dto"

# Migrate shared repositories
Write-Host "`nMigrating shared repositories..." -ForegroundColor Cyan
Copy-AndUpdateJavaFile "$baseDir\repository\UserRepository.java" "$baseDir\shared\repository\UserRepository.java" "edu.cit.sanchez.bidwarsonline.shared.repository"
Copy-AndUpdateJavaFile "$baseDir\repository\BetRecordRepository.java" "$baseDir\shared\repository\BetRecordRepository.java" "edu.cit.sanchez.bidwarsonline.shared.repository"
Copy-AndUpdateJavaFile "$baseDir\repository\BonusRepository.java" "$baseDir\shared\repository\BonusRepository.java" "edu.cit.sanchez.bidwarsonline.shared.repository"
Copy-AndUpdateJavaFile "$baseDir\repository\AnnouncementRepository.java" "$baseDir\shared\repository\AnnouncementRepository.java" "edu.cit.sanchez.bidwarsonline.shared.repository"

# Migrate shared DTOs
Write-Host "`nMigrating shared DTOs..." -ForegroundColor Cyan
Copy-AndUpdateJavaFile "$baseDir\dto\ApiResponse.java" "$baseDir\shared\dto\ApiResponse.java" "edu.cit.sanchez.bidwarsonline.shared.dto"
Copy-AndUpdateJavaFile "$baseDir\dto\PlaceBetRequest.java" "$baseDir\shared\dto\PlaceBetRequest.java" "edu.cit.sanchez.bidwarsonline.shared.dto"
Copy-AndUpdateJavaFile "$baseDir\dto\PlaceBetResponse.java" "$baseDir\shared\dto\PlaceBetResponse.java" "edu.cit.sanchez.bidwarsonline.shared.dto"
Copy-AndUpdateJavaFile "$baseDir\dto\GameType.java" "$baseDir\shared\dto\GameType.java" "edu.cit.sanchez.bidwarsonline.shared.dto"

# Migrate shared security
Write-Host "`nMigrating shared security..." -ForegroundColor Cyan
Copy-AndUpdateJavaFile "$baseDir\security\JwtService.java" "$baseDir\shared\security\JwtService.java" "edu.cit.sanchez.bidwarsonline.shared.security"
Copy-AndUpdateJavaFile "$baseDir\security\JwtAuthenticationFilter.java" "$baseDir\shared\security\JwtAuthenticationFilter.java" "edu.cit.sanchez.bidwarsonline.shared.security"

# Migrate shared config
Write-Host "`nMigrating shared config..." -ForegroundColor Cyan
Copy-AndUpdateJavaFile "$baseDir\config\SecurityConfig.java" "$baseDir\shared\config\SecurityConfig.java" "edu.cit.sanchez.bidwarsonline.shared.config"
Copy-AndUpdateJavaFile "$baseDir\config\WebSocketConfig.java" "$baseDir\shared\config\WebSocketConfig.java" "edu.cit.sanchez.bidwarsonline.shared.config"
Copy-AndUpdateJavaFile "$baseDir\config\RestTemplateConfig.java" "$baseDir\shared\config\RestTemplateConfig.java" "edu.cit.sanchez.bidwarsonline.shared.config"

# Migrate shared services
Write-Host "`nMigrating shared services..." -ForegroundColor Cyan
Copy-AndUpdateJavaFile "$baseDir\service\GameEngineService.java" "$baseDir\shared\service\GameEngineService.java" "edu.cit.sanchez.bidwarsonline.shared.service"
Copy-AndUpdateJavaFile "$baseDir\service\UserService.java" "$baseDir\shared\service\UserService.java" "edu.cit.sanchez.bidwarsonline.shared.service"

Write-Host "`n✅ Migration Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Delete old layered architecture directories (controller, service, repository, entity, dto, util, security, config)"
Write-Host "2. Build the project to verify all imports are correct"
Write-Host "3. Run tests to ensure functionality is preserved"
Write-Host "4. Review and commit changes"
