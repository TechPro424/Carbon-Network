@echo off
REM Carbon Ghost - Quick Demo Script (Windows)
REM Use this if you need to show the concept quickly without full deployment

echo.
echo ============================================
echo    Carbon Ghost - Quick Demo Mode
echo ============================================
echo.
echo This script simulates the full system locally for demo purposes
echo.

REM Create demo device if it doesn't exist
if not exist "devices\demo-device" (
    echo Creating demo device...
    mkdir devices\demo-device
)

echo.
echo Starting Carbon Ghost Demo...
echo.
timeout /t 1 /nobreak >nul

REM Simulate a power reading cycle
echo ================================================
echo PHASE 1: Hardware Layer
echo ================================================
echo Power Reading: 127W
echo Creating cryptographic signature...
echo [OK] Signature verified with TPM
echo.
timeout /t 2 /nobreak >nul

echo ================================================
echo PHASE 2: Relay Verification
echo ================================================
echo Verifying hardware signature...
echo [OK] Signature matches public key
echo [OK] No tampering detected
echo.
timeout /t 2 /nobreak >nul

echo ================================================
echo PHASE 3: Oracle Check
echo ================================================
echo Querying carbon intensity for region: IN-KA
echo Carbon Intensity: 285 gCO2/kWh
echo [OK] Grid Status: CLEAN
echo.
timeout /t 2 /nobreak >nul

echo ================================================
echo PHASE 4: Blockchain Update
echo ================================================
echo Submitting transaction to Polygon...
echo Transaction Hash: 0x7a3f9d2b8c4e1a5f...
echo [OK] Transaction confirmed in block 14520394
echo.
timeout /t 2 /nobreak >nul

echo ================================================
echo PHASE 5: Ghost Update
echo ================================================
echo Updating Ghost NFT...
echo   Health: 55 --^> 65 (+10)
echo   Mood: Happy
echo   Deposit: 1.0 MATIC --^> 1.005 MATIC (+0.005 reward)
echo   Green Credits: +1
echo.
timeout /t 2 /nobreak >nul

echo.
echo ================================================
echo            Demo Complete!
echo ================================================
echo.
echo Now switching to DIRTY grid scenario...
echo.
timeout /t 2 /nobreak >nul

echo ================================================
echo WARNING: DIRTY GRID SCENARIO
echo ================================================
echo.
echo Carbon Intensity: 420 gCO2/kWh
echo [!] Grid Status: DIRTY
echo.
echo Updating Ghost NFT...
echo   Health: 65 --^> 55 (-10)
echo   Mood: Smoggy
echo   Deposit: 1.005 --^> 0.995 MATIC (-0.01 slashed)
echo   Slashed amount sent to burn address
echo.
timeout /t 2 /nobreak >nul

echo.
echo ================================================
echo Demo Complete! Key Takeaways:
echo ================================================
echo.
echo [OK] Real-time verification (not annual averages)
echo [OK] Hardware attestation (can't lie about usage)
echo [OK] Immediate consequences (slash/reward)
echo [OK] Visual feedback (ghost changes)
echo [OK] Economic incentives (build equity in infrastructure)
echo.
echo Traditional carbon credits: Pay once a year, hope it works out
echo Carbon Ghost: Every compute cycle is measured and accountable
echo.
echo Press any key to exit...
pause >nul
