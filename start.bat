@echo off
TITLE Gemini Resize - Development Server
echo Checking dependencies...
if not exist "node_modules\" (
    echo node_modules not found. Installing dependencies...
    call npm install
)

echo Starting Vite development server...
call npm run dev -- --open
pause
