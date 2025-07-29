# import psycopg2
# import pandas as pd
# import joblib
# import os
# from dotenv import load_dotenv
# from sqlalchemy import create_engine

# load_dotenv()

# def generate_report():
#     # Use SQLAlchemy for pandas compatibility
#     db_url = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
#     engine = create_engine(db_url)
#     # Fetch all sensor logs (or a reasonable recent window)
#     df = pd.read_sql("SELECT * FROM sensor_logs", engine)
#     if df.empty:
#         return {"summary": {}, "recommendations": ["No sensor data available."], "details": []}
#     df['timestamp'] = pd.to_datetime(df['timestamp'])
#     df['date'] = df['timestamp'].dt.date

#     # Aggregate per home, per appliance, per day
#     daily_usage = df.groupby(['home_id', 'appliance_type', 'date']).agg({
#         'energy_consumption_kwh': ['sum', 'mean', 'max', 'count'],
#         'outdoor_temperature_c': 'mean',
#         'household_size': 'first'
#     })
#     daily_usage.columns = [
#         'Total_Consumption', 'Avg_Per_Appliance', 'Max_Single_Appliance', 'Appliance_Count',
#         'Avg_Temp', 'Household_Size'
#     ]
#     daily_usage.reset_index(inplace=True)
#     daily_usage['date'] = pd.to_datetime(daily_usage['date'])
#     daily_usage['Month'] = daily_usage['date'].dt.month
#     daily_usage['DayOfWeek'] = daily_usage['date'].dt.dayofweek
#     daily_usage['IsWeekend'] = daily_usage['DayOfWeek'].isin([5, 6]).astype(int)

#     # Features for prediction (match your model)
#     X = daily_usage[['Avg_Temp', 'Household_Size', 'Avg_Per_Appliance',
#                      'Max_Single_Appliance', 'Appliance_Count', 'Month', 'DayOfWeek', 'IsWeekend']]

#     # Load your trained pipeline
#     model = joblib.load(os.path.join(os.path.dirname(__file__), 'energy_consumption_model.pkl'))
#     predictions = model.predict(X)
#     daily_usage['predicted_consumption'] = predictions

#     # Recommendations: appliance-specific, actionable, consistent with predictions
#     recs = []
#     # Find top N (e.g., 3) highest predicted usage per home
#     for home_id in daily_usage['home_id'].unique():
#         home_data = daily_usage[daily_usage['home_id'] == home_id]
#         # For each appliance in this home, get the latest day's prediction
#         latest_day = home_data['date'].max()
#         latest_data = home_data[home_data['date'] == latest_day]
#         # Sort by predicted consumption
#         top_appliances = latest_data.sort_values('predicted_consumption', ascending=False).head(3)
#         for _, row in top_appliances.iterrows():
#             if row['predicted_consumption'] > 1.5:  # threshold for high usage
#                 recs.append(
#                     f"Home {int(row['home_id'])}: High predicted energy usage for {row['appliance_type']} on {row['date'].strftime('%Y-%m-%d')} ({row['predicted_consumption']:.2f} kWh). Consider reducing {row['appliance_type']} usage."
#                 )

#     # Weekly summary (sum by home)
#     last_week = daily_usage[daily_usage['date'] > (pd.Timestamp.now() - pd.Timedelta(days=7))]
#     weekly_kwh = last_week.groupby(['home_id', 'appliance_type'])['predicted_consumption'].sum().to_dict()

#     # Chart data: daily predicted kWh per home
#     chart_data = daily_usage.groupby(['date', 'home_id'])['predicted_consumption'].sum().unstack(fill_value=0)
#     chart_data = chart_data.tail(14)  # last 2 weeks
#     chart_data_json = {
#         'dates': [d.strftime('%Y-%m-%d') for d in chart_data.index],
#         'homes': list(chart_data.columns.astype(str)),
#         'values': chart_data.values.tolist()
#     }

#     report = {
#         "summary": {
#             "total_predicted_kwh": float(daily_usage['predicted_consumption'].sum()),
#             "num_records": int(len(daily_usage)),
#             "weekly_kwh": {str(k): float(v) for k, v in weekly_kwh.items()}
#         },
#         "recommendations": recs,
#         "chart_data": chart_data_json,
#         "details": daily_usage.to_dict(orient='records')
#     }
#     return report




































import psycopg2
import pandas as pd
import joblib
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

def generate_report():
    try:
        db_url = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
        engine = create_engine(db_url)
        
        df = pd.read_sql("SELECT * FROM sensor_logs", engine)
        if df.empty:
            return {
                "summary": {},
                "recommendations": ["No sensor data available."],
                "details": [],
                "chart_data": {"dates": [], "homes": [], "values": []}
            }

        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['date'] = df['timestamp'].dt.date

        daily_usage = df.groupby(['home_id', 'appliance_type', 'date']).agg({
            'energy_consumption_kwh': ['sum', 'mean', 'max', 'count'],
            'outdoor_temperature_c': 'mean',
            'household_size': 'first'
        })
        daily_usage.columns = [
            'Total_Consumption', 'Avg_Per_Appliance', 'Max_Single_Appliance', 'Appliance_Count',
            'Avg_Temp', 'Household_Size'
        ]
        daily_usage.reset_index(inplace=True)
        daily_usage['date'] = pd.to_datetime(daily_usage['date'])
        daily_usage['Month'] = daily_usage['date'].dt.month
        daily_usage['DayOfWeek'] = daily_usage['date'].dt.dayofweek
        daily_usage['IsWeekend'] = daily_usage['DayOfWeek'].isin([5, 6]).astype(int)

        X = daily_usage[['Avg_Temp', 'Household_Size', 'Avg_Per_Appliance',
                         'Max_Single_Appliance', 'Appliance_Count', 'Month', 'DayOfWeek', 'IsWeekend']]

        model_path = os.path.join(os.path.dirname(__file__), 'energy_consumption_model.pkl')
        model = joblib.load(model_path)
        predictions = model.predict(X)
        daily_usage['predicted_consumption'] = predictions

        recs = []
        for home_id in daily_usage['home_id'].unique():
            home_data = daily_usage[daily_usage['home_id'] == home_id]
            latest_day = home_data['date'].max()
            latest_data = home_data[home_data['date'] == latest_day]
            top_appliances = latest_data.sort_values('predicted_consumption', ascending=False).head(3)
            for _, row in top_appliances.iterrows():
                if row['predicted_consumption'] > 1.5:
                    recs.append(
                        f"Home {int(row['home_id'])}: High predicted energy usage for {row['appliance_type']} "
                        f"on {row['date'].strftime('%Y-%m-%d')} ({row['predicted_consumption']:.2f} kWh). "
                        f"Consider reducing {row['appliance_type']} usage."
                    )

        last_week = daily_usage[daily_usage['date'] > (pd.Timestamp.now() - pd.Timedelta(days=7))]
        weekly_kwh = last_week.groupby(['home_id', 'appliance_type'])['predicted_consumption'].sum().to_dict()

        chart_data = daily_usage.groupby(['date', 'home_id'])['predicted_consumption'].sum().unstack(fill_value=0)
        chart_data = chart_data.tail(14)
        
        return {
            "summary": {
                "total_predicted_kwh": float(daily_usage['predicted_consumption'].sum()),
                "num_records": int(len(daily_usage)),
                "weekly_kwh": {f"{k[0]}_{k[1]}": float(v) for k, v in weekly_kwh.items()}
            },
            "recommendations": recs,
            "chart_data": {
                "dates": [d.strftime('%Y-%m-%d') for d in chart_data.index],
                "homes": [str(h) for h in chart_data.columns],
                "values": [row.tolist() for _, row in chart_data.iterrows()]
            },
            "details": daily_usage.to_dict(orient='records')
        }
    except Exception as e:
        return {
            "error": str(e),
            "summary": {},
            "recommendations": ["Error generating report"],
            "details": []
        }