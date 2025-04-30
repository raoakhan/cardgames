# Card Games Deployment Script
# This script builds and deploys the Card Games application using Docker Compose

Write-Host "Card Games Deployment Script" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor Cyan

# Check if Docker is installed
Write-Host "Checking for Docker..." -ForegroundColor Yellow
$dockerCheck = docker --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker not found. Please install Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "Docker found: $dockerCheck" -ForegroundColor Green

# Check if Docker Compose is installed
Write-Host "Checking for Docker Compose..." -ForegroundColor Yellow
$composeCheck = docker-compose --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Compose not found. Please install Docker Compose and try again." -ForegroundColor Red
    exit 1
}
Write-Host "Docker Compose found: $composeCheck" -ForegroundColor Green

# Check if .env file exists for backend
if (-not (Test-Path -Path ".\backend\.env")) {
    Write-Host "Creating .env file for backend..." -ForegroundColor Yellow
    Copy-Item -Path ".\backend\.env.example" -Destination ".\backend\.env" -ErrorAction SilentlyContinue
    
    if (-not (Test-Path -Path ".\backend\.env")) {
        # Create a basic .env file if .env.example doesn't exist
        @"
DJANGO_SECRET_KEY=production_secret_key_change_me
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost,http://yourdomain.com
DATABASE_URL=postgresql://cardgames:cardgames_password@db:5432/cardgames_db
REDIS_URL=redis://redis:6379/0
"@ | Out-File -FilePath ".\backend\.env"
    }
}

# Build and start the containers
Write-Host "Building and starting containers..." -ForegroundColor Yellow
docker-compose up -d --build

# Check if containers are running
Write-Host "Checking container status..." -ForegroundColor Yellow
docker-compose ps

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "The application should be available at http://localhost" -ForegroundColor Cyan
Write-Host "Admin panel: http://localhost/admin/" -ForegroundColor Cyan

# Provide useful commands
Write-Host "`nUseful commands:" -ForegroundColor Yellow
Write-Host "View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "Stop application: docker-compose down" -ForegroundColor White
Write-Host "Restart application: docker-compose restart" -ForegroundColor White
Write-Host "Remove containers and volumes: docker-compose down -v" -ForegroundColor White
