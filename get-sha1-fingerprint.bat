@echo off
echo ========================================
echo Getting SHA-1 Fingerprints for Google OAuth
echo ========================================
echo.

echo [1] Debug Keystore SHA-1:
echo ----------------------------------------
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android | findstr /C:"SHA1"
echo.

echo [2] Release Keystore SHA-1:
echo ----------------------------------------
echo Please enter your release keystore path:
set /p KEYSTORE_PATH="Path: "
if not "%KEYSTORE_PATH%"=="" (
    echo Please enter your keystore alias:
    set /p KEY_ALIAS="Alias: "
    keytool -list -v -keystore "%KEYSTORE_PATH%" -alias %KEY_ALIAS% | findstr /C:"SHA1"
) else (
    echo Skipped release keystore
)
echo.

echo ========================================
echo Copy the SHA1 fingerprint(s) above and add them to:
echo Google Cloud Console ^> Credentials ^> Android OAuth Client
echo ========================================
pause
