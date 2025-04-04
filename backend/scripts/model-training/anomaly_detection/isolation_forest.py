import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib
import json
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IsolationForestAnomalyDetector:
    def __init__(self, config_path='config/anomaly_config.json'):
        """
        Initialize the anomaly detector with configuration
        
        Args:
            config_path: Path to JSON configuration file
        """
        self.config = self._load_config(config_path)
        self.model = None
        self.features = self.config['features']
        self.scaler = StandardScaler()
        
    def _load_config(self, config_path):
        """Load model configuration from JSON file"""
        try:
            with open(config_path) as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            raise

    def _preprocess_data(self, df):
        """
        Preprocess input data with feature engineering
        
        Args:
            df: Raw input DataFrame
            
        Returns:
            Processed DataFrame with features
        """
        try:
            # Convert timestamp if exists
            if 'timestamp' in df.columns:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                df['hour_of_day'] = df['timestamp'].dt.hour
                df['day_of_week'] = df['timestamp'].dt.dayofweek
            
            # Calculate derived features
            if all(col in df.columns for col in ['actual_delivery_time', 'expected_delivery_time']):
                df['delivery_deviation'] = df['actual_delivery_time'] - df['expected_delivery_time']
            
            if all(col in df.columns for col in ['supplies_used', 'initial_inventory']):
                df['inventory_turnover'] = df['supplies_used'] / df['initial_inventory']
            
            return df[self.features]
        
        except Exception as e:
            logger.error(f"Preprocessing error: {e}")
            raise

    def train(self, data_path):
        """
        Train the Isolation Forest model
        
        Args:
            data_path: Path to training data CSV
        """
        try:
            logger.info(f"Loading training data from {data_path}")
            df = pd.read_csv(data_path)
            processed_data = self._preprocess_data(df)
            
            logger.info("Training Isolation Forest model")
            self.model = Pipeline([
                ('scaler', StandardScaler()),
                ('isolation_forest', IsolationForest(
                    n_estimators=self.config['n_estimators'],
                    max_samples=self.config['max_samples'],
                    contamination=self.config['contamination'],
                    random_state=self.config['random_state'],
                    n_jobs=-1
                ))
            ])
            
            self.model.fit(processed_data)
            logger.info("Model training completed")
            return self
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            raise

    def detect(self, X):
        """
        Detect anomalies in new data
        
        Args:
            X: Input data (DataFrame or dict)
            
        Returns:
            dict: {'is_anomaly': array, 'anomaly_score': array}
        """
        try:
            if not self.model:
                raise RuntimeError("Model not trained. Call train() first.")
                
            if isinstance(X, dict):
                X = pd.DataFrame([X])
                
            processed_data = self._preprocess_data(X)
            
            predictions = self.model.predict(processed_data)
            scores = self.model.decision_function(processed_data)
            
            return {
                'is_anomaly': (predictions == -1).astype(int),
                'anomaly_score': scores,
                'features': processed_data.to_dict('records')[0]
            }
            
        except Exception as e:
            logger.error(f"Detection failed: {e}")
            raise

    def save(self, output_dir='models/anomaly_detection'):
        """Save trained model to disk"""
        try:
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            model_path = f"{output_dir}/isolation_forest.joblib"
            joblib.dump(self.model, model_path)
            logger.info(f"Model saved to {model_path}")
            return model_path
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
            raise

    @classmethod
    def load(cls, model_path):
        """Load trained model from disk"""
        try:
            model = joblib.load(model_path)
            detector = cls()
            detector.model = model
            logger.info(f"Model loaded from {model_path}")
            return detector
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise