import random
from datetime import datetime
import psycopg2

# Simulate random sensor row
def generate_sensor_row():
    return {
        'home_id': random.randint(1, 500),
        'appliance_type': random.choice(['Fridge', 'Oven', 'Microwave', 'Heater', 'Dishwasher']),
        'energy_consumption_kwh': round(random.uniform(0.1, 4.0), 2),
        'timestamp': datetime.now(),
        'outdoor_temperature_c': round(random.uniform(-5, 40), 1),
        'season': random.choice(['Winter', 'Spring', 'Summer', 'Fall']),
        'household_size': random.randint(1, 5)
    }

# Insert into PostgreSQL
def log_to_db(data):
    conn = psycopg2.connect(
        dbname='smart_home',
        user='smart_home_admin',
        password='123',
        host='localhost',
        port='5432'
    )
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO sensor_logs (
            home_id, appliance_type, energy_consumption_kwh,
            timestamp, outdoor_temperature_c, season, household_size
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        data['home_id'],
        data['appliance_type'],
        data['energy_consumption_kwh'],
        data['timestamp'],
        data['outdoor_temperature_c'],
        data['season'],
        data['household_size']
    ))
    conn.commit()
    cur.close()
    conn.close()
    print(f"Logged data at {data['timestamp']}")

if __name__ == "__main__":
    row = generate_sensor_row()
    log_to_db(row)
