# backend/scripts/model-training/prophet/demand_forecasting.py

import pandas as pd
from prophet import Prophet
import json
import os
from datetime import datetime
import matplotlib.pyplot as plt
import numpy as np

class EmergencyDemandForecaster:
    def __init__(self):
        self.model = None
        self.forecast = None

    def load_data(self, data_path):
        """Load and preprocess historical demand data"""
        with open(data_path) as f:
            data = json.load(f)
        
        df = pd.DataFrame(data['demand_history'])
        df['ds'] = pd.to_datetime(df['date'])
        df['y'] = df['demand']
        
        # Ensure no negative demand values
        df['y'] = df['y'].clip(lower=0.1)  # Small positive value instead of 0
        return df[['ds', 'y']]

    def train_model(self, data_path, model_path):
        """Train and save Prophet model with optimized parameters"""
        df = self.load_data(data_path)
        
        # Initialize model with constrained parameters
        self.model = Prophet(
            growth='linear',
            seasonality_mode='additive',  # Prevents negative values
            yearly_seasonality=False,     # Disable yearly patterns
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.01,  # Smoother trends
            seasonality_prior_scale=10.0,
            holidays_prior_scale=10.0,
            mcmc_samples=0,
            interval_width=0.95
        )
        
        # Add custom seasonality if needed
        self.model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
        
        self.model.fit(df)
        
        # Save model
        with open(model_path, 'wb') as f:
            import pickle
            pickle.dump(self.model, f)
        
        return self.model

    def make_forecast(self, model_path, periods=7):
        """Generate forecast with positive value enforcement"""
        with open(model_path, 'rb') as f:
            import pickle
            self.model = pickle.load(f)
        
        future = self.model.make_future_dataframe(periods=periods)
        self.forecast = self.model.predict(future)
        
        # Enforce positive predictions
        for col in ['yhat', 'yhat_lower', 'yhat_upper']:
            self.forecast[col] = np.maximum(self.forecast[col], 0)
            
        return self.forecast

    def plot_forecast(self, save_path=None):
        """Visualize forecast results with positive y-axis"""
        if self.forecast is None:
            raise ValueError("No forecast available. Run make_forecast() first.")
            
        fig = self.model.plot(self.forecast)
        ax = fig.gca()
        ax.set_ylim(bottom=0)  # Force y-axis to start at 0
        ax.set_title('Emergency Supply Demand Forecast', fontsize=14)
        ax.set_ylabel('Demand (units)')
        
        if save_path:
            # Ensure directory exists
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            plt.savefig(save_path, bbox_inches='tight')
            plt.close()
        else:
            plt.show()

def main():
    # Initialize forecaster
    forecaster = EmergencyDemandForecaster()
    
    # Configure paths
    base_dir = r'C:\xampp\htdocs\emergency-optimizer\backend'
    data_path = os.path.join(base_dir, 'data', 'demand_history.json')
    model_path = os.path.join(base_dir, 'scripts', 'model-training', 'prophet', 'demand_forecaster.pkl')
    plot_path = os.path.join(base_dir, 'static', 'forecast_plot.png')
    
    try:
        # 1. Train model
        print("Training demand forecasting model...")
        forecaster.train_model(data_path, model_path)
        
        # 2. Generate forecast
        print("Generating 14-day demand forecast...")
        forecast = forecaster.make_forecast(model_path, periods=14)
        
        # 3. Save visualization
        forecaster.plot_forecast(plot_path)
        print(f"Forecast plot saved to {plot_path}")
        
        # 4. Print results
        print("\nKey Forecast Metrics (next 14 days):")
        print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(14).to_string())
        
    except Exception as e:
        print(f"\nError: {str(e)}")
        print("Possible solutions:")
        print("1. Verify data file exists at:", data_path)
        print("2. Check all demand values are positive in the JSON file")
        print("3. Ensure directory permissions for:", os.path.dirname(plot_path))

if __name__ == "__main__":
    main()