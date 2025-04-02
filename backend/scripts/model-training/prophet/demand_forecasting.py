from prophet import Prophet
import pandas as pd
import joblib

def train_demand_model():
    # Load historical data
    df = pd.read_csv('../database/disaster_history.csv')
    
    # Prepare data for Prophet
    df = df.rename(columns={'date': 'ds', 'supply_demand': 'y'})
    
    # Initialize and fit model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False
    )
    model.fit(df)
    
    # Save model
    joblib.dump(model, '../pre-trained-models/demand_prophet.pkl')

def predict_demand(disaster_type, days=7):
    model = joblib.load('../pre-trained-models/demand_prophet.pkl')
    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future)
    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(days)