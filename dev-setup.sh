#!/bin/bash
# Card Games Development Setup Script
# This script sets up and runs the development environment for the Card Games app

echo -e "\e[36mSetting up Card Games development environment...\e[0m"

# Check for Python
echo -e "\e[33mChecking for Python...\e[0m"
if ! command -v python3 &> /dev/null; then
    echo -e "\e[31mPython not found. Please install Python 3.8+ and try again.\e[0m"
    exit 1
fi
echo -e "\e[32mPython found: $(python3 --version)\e[0m"

# Check for Node.js
echo -e "\e[33mChecking for Node.js...\e[0m"
if ! command -v node &> /dev/null; then
    echo -e "\e[31mNode.js not found. Please install Node.js 16+ and try again.\e[0m"
    exit 1
fi
echo -e "\e[32mNode.js found: $(node --version)\e[0m"

# Setup Backend
echo -e "\e[36mSetting up backend...\e[0m"
cd ./backend

# Create virtual environment if it doesn't exist
if [ ! -d "env" ]; then
    echo -e "\e[33mCreating Python virtual environment...\e[0m"
    python3 -m venv env
fi

# Activate virtual environment
echo -e "\e[33mActivating virtual environment...\e[0m"
source env/bin/activate

# Install backend dependencies
echo -e "\e[33mInstalling backend dependencies...\e[0m"
pip install -r requirements.txt

# Run migrations
echo -e "\e[33mRunning migrations...\e[0m"
python manage.py migrate

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "\e[33mCreating .env file...\e[0m"
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        # Create a basic .env file if .env.example doesn't exist
        cat > .env << EOL
DJANGO_SECRET_KEY=development_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:4200
DATABASE_URL=sqlite:///db.sqlite3
EOL
    fi
fi

# Start Django server in background
echo -e "\e[33mStarting Django server...\e[0m"
python manage.py runserver &
DJANGO_PID=$!

# Return to root directory
cd ..

# Setup Frontend
echo -e "\e[36mSetting up frontend...\e[0m"
cd ./frontend

# Install frontend dependencies
echo -e "\e[33mInstalling frontend dependencies...\e[0m"
npm install

# Start Angular development server
echo -e "\e[33mStarting Angular development server...\e[0m"
npx ng serve --open &
ANGULAR_PID=$!

echo -e "\e[32mDevelopment environment started!\e[0m"
echo -e "\e[36mBackend: http://localhost:8000\e[0m"
echo -e "\e[36mFrontend: http://localhost:4200\e[0m"
echo -e "\e[33mPress Ctrl+C to stop the development servers\e[0m"

# Add trap to kill processes on exit
trap "kill $DJANGO_PID $ANGULAR_PID; echo -e '\e[33mShutting down development environment...\e[0m'; echo -e '\e[32mDevelopment environment shut down.\e[0m'" EXIT

# Keep script running
wait
