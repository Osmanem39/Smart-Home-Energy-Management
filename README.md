# Smart Home Dashboard Setup Guide

## Project Overview
This is a Smart Home Energy Dashboard with:
- **Frontend**: React dashboard for monitoring and controlling smart home devices
- **Backend**: Flask API with PostgreSQL database and JWT authentication
- **Features**: User registration/login, sensor data monitoring, device control, energy reports

## Prerequisites
- Node.js and npm
- Python 3.8+
- PostgreSQL database
- pip (Python package manager)

## Setup Instructions

### 1. Database Setup
1. Install PostgreSQL if not already installed
2. Create a database:
   ```sql
   CREATE DATABASE smart_home_db;
   ```
3. Create a `.env` file in the `backend/` directory with your database credentials:
   ```
   DB_NAME=smart_home_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_HOST=localhost
   JWT_SECRET_KEY=your-super-secret-jwt-key
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate virtual environment:
   ```bash
   python -m venv smart_home_env
   source smart_home_env/bin/activate  # On Windows: smart_home_env\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```bash
   python app.py
   ```
   The backend will run on http://localhost:5000

### 3. Frontend Setup
1. Navigate to the project root:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on http://localhost:3000

## User Authentication

### Registration
- Users can register with:
  - Username (minimum 3 characters)
  - Password (minimum 6 characters)
  - Email (optional)

### Login
- Users can login with their registered username and password
- JWT tokens are used for authentication
- Tokens are stored in localStorage

## Features

### Dashboard
- View live sensor data
- Monitor energy consumption
- Track temperature and seasonal data

### Device Control
- Toggle smart devices on/off
- Control device status by ID

### Reports
- View energy consumption reports
- See predictions and recommendations
- Interactive charts and graphs

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/sensors` - Get sensor data (requires auth)
- `POST /api/device/<id>` - Toggle device (requires auth)
- `GET /api/report` - Get energy report (requires auth)

## Security Features
- Password hashing with salt
- JWT token authentication
- Input validation
- SQL injection protection

## Troubleshooting

### Common Issues:
1. **Database Connection Error**: Check your `.env` file and ensure PostgreSQL is running
2. **Port Already in Use**: Change the port in `app.py` or kill the process using the port
3. **Module Not Found**: Ensure all dependencies are installed with `pip install -r requirements.txt`

### Getting Help:
- Check the console for error messages
- Ensure all services are running (PostgreSQL, Backend, Frontend)
- Verify environment variables are set correctly 
