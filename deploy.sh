#!/bin/bash
# Card Games Deployment Script
# This script builds and deploys the Card Games application using Docker Compose

echo -e "\e[36mCard Games Deployment Script\e[0m"
echo -e "\e[36m-----------------------------\e[0m"

# Check if Docker is installed
echo -e "\e[33mChecking for Docker...\e[0m"
if ! command -v docker &> /dev/null; then
    echo -e "\e[31mDocker not found. Please install Docker and try again.\e[0m"
    exit 1
fi
echo -e "\e[32mDocker found: $(docker --version)\e[0m"

# Check if Docker Compose is installed
echo -e "\e[33mChecking for Docker Compose...\e[0m"
if ! command -v docker-compose &> /dev/null; then
    echo -e "\e[31mDocker Compose not found. Please install Docker Compose and try again.\e[0m"
    exit 1
fi
echo -e "\e[32mDocker Compose found: $(docker-compose --version)\e[0m"

# Check if .env file exists for backend
if [ ! -f "./backend/.env" ]; then
    echo -e "\e[33mCreating .env file for backend...\e[0m"
    if [ -f "./backend/.env.example" ]; then
        cp ./backend/.env.example ./backend/.env
    else
        # Create a basic .env file if .env.example doesn't exist
        cat > ./backend/.env << EOL
DJANGO_SECRET_KEY=production_secret_key_change_me
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost,http://yourdomain.com
DATABASE_URL=postgresql://cardgames:cardgames_password@db:5432/cardgames_db
REDIS_URL=redis://redis:6379/0
EOL
    fi
fi

# Build and start the containers
echo -e "\e[33mBuilding and starting containers...\e[0m"
docker-compose up -d --build

# Check if containers are running
echo -e "\e[33mChecking container status...\e[0m"
docker-compose ps

echo -e "\e[32mDeployment complete!\e[0m"
echo -e "\e[36mThe application should be available at http://localhost\e[0m"
echo -e "\e[36mAdmin panel: http://localhost/admin/\e[0m"

# Provide useful commands
echo -e "\n\e[33mUseful commands:\e[0m"
echo -e "View logs: docker-compose logs -f"
echo -e "Stop application: docker-compose down"
echo -e "Restart application: docker-compose restart"
echo -e "Remove containers and volumes: docker-compose down -v"
