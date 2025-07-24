import pandas as pd
import psycopg2
from datetime import datetime

# Load CSV
df = pd.read_csv("smart_home_energy_consumption_large.csv")

# Convert to datetime
df['timestamp'] = pd.to_datetime(df['Date'] + ' ' + df['Time'])
df.drop(columns=['Date', 'Time'], inplace=True)

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname='smart_home',
    user='smart_home_admin',
    password='123',
    host='localhost',
    port='5432'
)
cur = conn.cursor()

# Insert data
for _, row in df.iterrows():
    cur.execute("""
        INSERT INTO sensor_logs (
            home_id, appliance_type, energy_consumption_kwh,
            timestamp, outdoor_temperature_c, season, household_size
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        row['Home ID'],
        row['Appliance Type'],
        row['Energy Consumption (kWh)'],
        row['timestamp'],
        row['Outdoor Temperature (°C)'],
        row['Season'],
        row['Household Size']
    ))

conn.commit()
cur.close()
conn.close()
print("Initial data loaded into sensor_logs.")
