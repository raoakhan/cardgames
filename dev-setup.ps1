# Card Games Development Setup Script
# This script sets up and runs the development environment for the Card Games app

Write-Host "Setting up Card Games development environment..." -ForegroundColor Cyan

# Check for Python
Write-Host "Checking for Python..." -ForegroundColor Yellow
$pythonCheck = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Python not found. Please install Python 3.8+ and try again." -ForegroundColor Red
    exit 1
}
Write-Host "Python found: $pythonCheck" -ForegroundColor Green

# Check for Node.js
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
$nodeCheck = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Node.js not found. Please install Node.js 16+ and try again." -ForegroundColor Red
    exit 1
}
Write-Host "Node.js found: $nodeCheck" -ForegroundColor Green

# Setup Backend
Write-Host "Setting up backend..." -ForegroundColor Cyan
Set-Location -Path ".\backend"

# Create virtual environment if it doesn't exist
if (-not (Test-Path -Path "env")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv env
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\env\Scripts\Activate.ps1

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Run migrations
Write-Host "Running migrations..." -ForegroundColor Yellow
python manage.py migrate

# Create .env file if it doesn't exist
if (-not (Test-Path -Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item -Path ".env.example" -Destination ".env" -ErrorAction SilentlyContinue
    
    if (-not (Test-Path -Path ".env")) {
        # Create a basic .env file if .env.example doesn't exist
        @"
DJANGO_SECRET_KEY=development_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:4200
DATABASE_URL=sqlite:///db.sqlite3
"@ | Out-File -FilePath ".env"
    }
}

# Start Django server in a new window
Start-Process powershell -ArgumentList "-Command", "& {Set-Location '$PWD'; & .\env\Scripts\Activate.ps1; python manage.py runserver; Read-Host 'Press Enter to close'}"

# Return to root directory
Set-Location -Path ".."

# Setup Frontend
Write-Host "Setting up frontend..." -ForegroundColor Cyan
Set-Location -Path ".\frontend"

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

# Start Angular development server
Write-Host "Starting Angular development server..." -ForegroundColor Yellow
npx ng serve --open

Write-Host "Development environment started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:4200" -ForegroundColor Cyan
Write-Host "Use Ctrl+C to stop the development servers" -ForegroundColor Yellow

# Keep the script running
Read-Host "Press Enter to shut down all servers"

# Cleanup
Write-Host "Shutting down development environment..." -ForegroundColor Yellow
# Find and kill processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq "" } | Stop-Process
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq "" } | Stop-Process

Write-Host "Development environment shut down." -ForegroundColor Green
