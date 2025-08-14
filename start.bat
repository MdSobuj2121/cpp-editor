@echo off
echo Starting CP Master Setup...
echo.

REM Check if VS Code is installed
where code >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Visual Studio Code is not installed!
    echo Please install VS Code from: https://code.visualstudio.com/
    echo.
    pause
    exit /b 1
)

REM Check if Live Server extension is installed
code --list-extensions | findstr "ritwickdey.liveserver" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Live Server extension...
    code --install-extension ritwickdey.liveserver
) else (
    echo Live Server extension is already installed.
)

REM Open project in VS Code
echo.
echo Opening project in VS Code...
code .

REM Instructions
echo.
echo Setup Complete!
echo.
echo To start the application:
echo 1. In VS Code, right-click on index.html
echo 2. Select "Open with Live Server"
echo 3. Your default browser will open automatically
echo.
echo Don't forget to configure your API keys in js/config.js
echo.
pause
