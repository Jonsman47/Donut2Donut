@echo off
setlocal enabledelayedexpansion

set "dir_path=c:\Users\Timéo\Desktop\D2D\Donut2Donut\app\profile\[username]"

for /f "delims=" %%f in ('dir /b /a-d "%dir_path%\page.*" 2^>nul ^| findstr /v "layout.tsx"') do (
    echo Suppression de: %%f
    del /f /q "%dir_path%\%%f"
)

echo Nettoyage terminé.
pause
