@echo off
setlocal enabledelayedexpansion

echo CP Master Development Environment Setup
echo =====================================
echo.

:check_vscode
where code >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Visual Studio Code is not installed!
    echo Please install VS Code from: https://code.visualstudio.com/
    echo.
    pause
    exit /b 1
)

:setup_extensions
echo Installing VS Code Extensions...
echo ------------------------------

set extensions=^
    ritwickdey.liveserver^
    esbenp.prettier-vscode^
    dbaeumer.vscode-eslint^
    ms-vscode.js-debug

for %%x in (%extensions%) do (
    echo Installing %%x...
    code --install-extension %%x
)

:create_vscode_config
echo.
echo Creating VS Code Configuration...
echo ------------------------------

if not exist .vscode mkdir .vscode

:: Create launch.json
echo Creating debug configuration...
(
    echo {
    echo     "version": "0.2.0",
    echo     "configurations": [
    echo         {
    echo             "type": "chrome",
    echo             "request": "launch",
    echo             "name": "Launch Chrome against localhost",
    echo             "url": "http://localhost:5500",
    echo             "webRoot": "${workspaceFolder}"
    echo         }
    echo     ]
    echo }
) > .vscode\launch.json

:: Create settings.json
echo Creating workspace settings...
(
    echo {
    echo     "editor.formatOnSave": true,
    echo     "editor.defaultFormatter": "esbenp.prettier-vscode",
    echo     "liveServer.settings.donotShowInfoMsg": true,
    echo     "liveServer.settings.donotVerifyTags": true
    echo }
) > .vscode\settings.json

:: Create extensions.json
echo Creating recommended extensions list...
(
    echo {
    echo     "recommendations": [
    echo         "ritwickdey.liveserver",
    echo         "esbenp.prettier-vscode",
    echo         "dbaeumer.vscode-eslint",
    echo         "ms-vscode.js-debug"
    echo     ]
    echo }
) > .vscode\extensions.json

:create_env_file
echo.
echo Creating environment configuration...
echo ------------------------------

if not exist .env (
    echo Creating .env file...
    (
        echo # API Keys
        echo JUDGE0_API_KEY=your_rapidapi_key_here
        echo.
        echo # Development Settings
        echo DEBUG_MODE=true
        echo ENABLE_LOGGING=true
        echo.
        echo # Cache Settings
        echo CACHE_DURATION=3600
        echo MAX_CACHE_SIZE=50
    ) > .env
)

:setup_git_hooks
echo.
echo Setting up Git hooks...
echo --------------------

if not exist .git\hooks mkdir .git\hooks

:: Create pre-commit hook
echo Creating pre-commit hook...
(
    echo #!/bin/sh
    echo.
    echo echo "Running pre-commit checks..."
    echo.
    echo # Check for API keys in code
    echo if grep -r "your_rapidapi_key_here" ./js/; then
    echo     echo "Error: Found placeholder API key. Please replace it with your actual key."
    echo     exit 1
    echo fi
    echo.
    echo # Add more checks as needed
    echo.
    echo echo "Pre-commit checks passed."
) > .git\hooks\pre-commit

:: Make the hook executable
icacls .git\hooks\pre-commit /grant Everyone:RX >nul

:final_steps
echo.
echo Setup Complete!
echo ==============
echo.
echo Next steps:
echo 1. Update your API keys in .env file
echo 2. Open the project in VS Code: code .
echo 3. Start Live Server: Right click on index.html and select "Open with Live Server"
echo 4. Press F5 to start debugging
echo.
echo For development help:
echo - Check DEBUG.md for troubleshooting guides
echo - Use Chrome DevTools (F12) for debugging
echo - Check the console for errors
echo.
pause
