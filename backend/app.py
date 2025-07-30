# import os
# import hashlib
# import secrets
# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
# from flask_jwt_extended import (
#     JWTManager, create_access_token, jwt_required, get_jwt_identity
# )
# import psycopg2
# from dotenv import load_dotenv

# load_dotenv()

# app = Flask(__name__, static_folder='../frontend/smart-home-dashboard/build', static_url_path='/')
# CORS(app)
# app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
# jwt = JWTManager(app)

# def get_db():
#     return psycopg2.connect(
#         dbname=os.getenv('DB_NAME'),
#         user=os.getenv('DB_USER'),
#         password=os.getenv('DB_PASSWORD'),
#         host=os.getenv('DB_HOST')
#     )

# def hash_password(password):
#     """Hash a password using SHA-256 with salt"""
#     salt = secrets.token_hex(16)
#     hash_obj = hashlib.sha256((password + salt).encode())
#     return f"{salt}${hash_obj.hexdigest()}"

# def verify_password(password, hashed_password):
#     """Verify a password against its hash"""
#     try:
#         salt, hash_value = hashed_password.split('$')
#         hash_obj = hashlib.sha256((password + salt).encode())
#         return hash_obj.hexdigest() == hash_value
#     except:
#         return False

# def init_db():
#     """Initialize database tables if they don't exist"""
#     conn = get_db()
#     cur = conn.cursor()
    
#     # Create users table
#     cur.execute("""
#         CREATE TABLE IF NOT EXISTS users (
#             id SERIAL PRIMARY KEY,
#             username VARCHAR(50) UNIQUE NOT NULL,
#             password_hash VARCHAR(255) NOT NULL,
#             email VARCHAR(100),
#             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#         )
#     """)
    
#     # Create sensor_logs table
#     cur.execute("""
#         CREATE TABLE IF NOT EXISTS sensor_logs (
#             id SERIAL PRIMARY KEY,
#             home_id INTEGER,
#             appliance_type VARCHAR(50),
#             energy_consumption_kwh DECIMAL(10,2),
#             timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#             outdoor_temperature_c DECIMAL(5,2),
#             season VARCHAR(20),
#             household_size INTEGER
#         )
#     """)
    
#     # Create device_logs table
#     cur.execute("""
#         CREATE TABLE IF NOT EXISTS device_logs (
#             id SERIAL PRIMARY KEY,
#             timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#             device_id INTEGER,
#             status BOOLEAN
#         )
#     """)
    
#     conn.commit()
#     cur.close()
#     conn.close()

# @app.route('/api/register', methods=['POST'])
# def register():
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')
#     email = data.get('email', '')
    
#     if not username or not password:
#         return jsonify({"msg": "Username and password are required"}), 400
    
#     if len(password) < 6:
#         return jsonify({"msg": "Password must be at least 6 characters long"}), 400
    
#     conn = get_db()
#     cur = conn.cursor()
    
#     try:
#         # Check if username already exists
#         cur.execute("SELECT id FROM users WHERE username=%s", (username,))
#         if cur.fetchone():
#             return jsonify({"msg": "Username already exists"}), 409
        
#         # Hash password and create user
#         password_hash = hash_password(password)
#         cur.execute(
#             "INSERT INTO users (username, password_hash, email) VALUES (%s, %s, %s)",
#             (username, password_hash, email)
#         )
#         conn.commit()
        
#         return jsonify({"msg": "User registered successfully"}), 201
        
#     except Exception as e:
#         conn.rollback()
#         return jsonify({"msg": "Registration failed"}), 500
#     finally:
#         cur.close()
#         conn.close()

# @app.route('/api/login', methods=['POST'])
# def login():
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')
    
#     if not username or not password:
#         return jsonify({"msg": "Username and password are required"}), 400
    
#     conn = get_db()
#     cur = conn.cursor()
    
#     try:
#         cur.execute("SELECT password_hash FROM users WHERE username=%s", (username,))
#         row = cur.fetchone()
        
#         if row and verify_password(password, row[0]):
#             access_token = create_access_token(identity=username)
#             return jsonify(access_token=access_token)
#         else:
#             return jsonify({"msg": "Invalid username or password"}), 401
#     finally:
#         cur.close()
#         conn.close()

# @app.route('/api/sensors', methods=['GET'])
# @jwt_required()
# def get_sensors():
#     conn = get_db()
#     cur = conn.cursor()
#     cur.execute("SELECT * FROM sensor_logs ORDER BY timestamp DESC LIMIT 10")
#     rows = cur.fetchall()
#     columns = [desc[0] for desc in cur.description]
#     data = [dict(zip(columns, row)) for row in rows]
#     return jsonify(data)

# @app.route('/api/device/<int:device_id>', methods=['POST'])
# @jwt_required()
# def toggle_device(device_id):
#     status = request.json.get('status')
#     conn = get_db()
#     cur = conn.cursor()
#     cur.execute("INSERT INTO device_logs (timestamp, device_id, status) VALUES (NOW(), %s, %s)", (device_id, status))
#     conn.commit()
#     return jsonify({"msg": "Device toggled"})

# @app.route('/api/report', methods=['GET'])
# @jwt_required()
# def get_report():
#     from report_generator import generate_report
#     report = generate_report()
#     return jsonify(report)

# @app.route('/api/devices', methods=['GET'])
# @jwt_required()
# def get_devices():
#     conn = get_db()
#     cur = conn.cursor()
#     cur.execute("SELECT DISTINCT home_id, appliance_type FROM sensor_logs ORDER BY home_id, appliance_type")
#     rows = cur.fetchall()
#     devices = [
#         {"home_id": row[0], "appliance_type": row[1], "device_id": f"{row[0]}_{row[1]}"}
#         for row in rows
#     ]
#     return jsonify(devices)

# @app.route('/', defaults={'path': ''})
# @app.route('/<path:path>')
# def serve(path):
#     if path != "" and os.path.exists(app.static_folder + '/' + path):
#         return send_from_directory(app.static_folder, path)
#     else:
#         return send_from_directory(app.static_folder, 'index.html')

# if __name__ == '__main__':
#     # Initialize database tables
#     init_db()
#     app.run(host='0.0.0.0', port=5000)






















































import os
import hashlib
import secrets
from datetime import timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity,
    verify_jwt_in_request
)
import psycopg2
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='../frontend/smart-home-dashboard/build', static_url_path='/')
CORS(app, supports_credentials=True)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

def get_db():
    return psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST')
    )

def hash_password(password):
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((password + salt).encode())
    return f"{salt}${hash_obj.hexdigest()}"

def verify_password(password, hashed_password):
    try:
        salt, hash_value = hashed_password.split('$')
        hash_obj = hashlib.sha256((password + salt).encode())
        return hash_obj.hexdigest() == hash_value
    except:
        return False

def init_db():
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sensor_logs (
            id SERIAL PRIMARY KEY,
            home_id INTEGER,
            appliance_type VARCHAR(50),
            energy_consumption_kwh DECIMAL(10,2),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            outdoor_temperature_c DECIMAL(5,2),
            season VARCHAR(20),
            household_size INTEGER
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS device_logs (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            device_id INTEGER,
            status BOOLEAN
        )
    """)
    
    conn.commit()
    cur.close()
    conn.close()

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({"msg": "Not authorized"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email', '')
    
    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400
    
    if len(password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters long"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM users WHERE username=%s", (username,))
        if cur.fetchone():
            return jsonify({"msg": "Username already exists"}), 409
        
        password_hash = hash_password(password)
        cur.execute(
            "INSERT INTO users (username, password_hash, email) VALUES (%s, %s, %s)",
            (username, password_hash, email)
        )
        conn.commit()
        return jsonify({"msg": "User registered successfully"}), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({"msg": "Registration failed", "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id, password_hash FROM users WHERE username=%s", (username,))
        row = cur.fetchone()
        
        if row and verify_password(password, row[1]):
            access_token = create_access_token(identity=username)
            return jsonify({
                "access_token": access_token,
                "user_id": row[0],
                "username": username
            })
        return jsonify({"msg": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"msg": "Login failed", "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/sensors', methods=['GET'])
@jwt_required()
def get_sensors():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM sensor_logs ORDER BY timestamp DESC LIMIT 10")
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
        return jsonify(data)
    except Exception as e:
        return jsonify({"msg": "Error fetching sensor data", "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/device/<int:device_id>', methods=['POST'])
@jwt_required()
def toggle_device(device_id):
    try:
        status = request.json.get('status')
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO device_logs (device_id, status) VALUES (%s, %s)",
            (device_id, status)
        )
        conn.commit()
        return jsonify({"msg": "Device toggled", "device_id": device_id, "status": status})
    except Exception as e:
        conn.rollback()
        return jsonify({"msg": "Error toggling device", "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/report', methods=['GET'])
@jwt_required()
def get_report():
    try:
        from report_generator import generate_report
        report = generate_report()
        return jsonify(report)
    except Exception as e:
        return jsonify({"msg": "Error generating report", "error": str(e)}), 500

@app.route('/api/devices', methods=['GET'])
@jwt_required()
def get_devices():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT home_id, appliance_type FROM sensor_logs ORDER BY home_id, appliance_type")
        rows = cur.fetchall()
        devices = [
            {"home_id": row[0], "appliance_type": row[1], "device_id": f"{row[0]}_{row[1]}"}
            for row in rows
        ]
        return jsonify(devices)
    except Exception as e:
        return jsonify({"msg": "Error fetching devices", "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)