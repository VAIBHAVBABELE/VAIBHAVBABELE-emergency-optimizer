import pytest
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from backend.scripts.model_training.anomaly_detection.isolation_forest import IsolationForestAnomalyDetector

@pytest.fixture
def sample_data():
    return pd.DataFrame({
        'timestamp': ['2023-01-01 08:00', '2023-01-01 12:00'],
        'supply_consumption_rate': [1.2, 3.4],
        'actual_delivery_time': [5.1, 3.2],
        'expected_delivery_time': [5.0, 3.0],
        'supplies_used': [100, 200],
        'initial_inventory': [1000, 1000],
        'request_frequency': [5, 10]
    })

@pytest.fixture
def detector(tmp_path):
    # Create temp config
    config = {
        "n_estimators": 10,
        "max_samples": "auto",
        "contamination": 0.1,
        "random_state": 42,
        "features": [
            "supply_consumption_rate",
            "delivery_deviation",
            "inventory_turnover",
            "request_frequency",
            "hour_of_day",
            "day_of_week"
        ]
    }
    
    config_path = tmp_path / "test_config.json"
    with open(config_path, 'w') as f:
        json.dump(config, f)
        
    return IsolationForestAnomalyDetector(config_path)

def test_train_and_detect(detector, sample_data, tmp_path):
    # Test training
    data_path = tmp_path / "test_data.csv"
    sample_data.to_csv(data_path, index=False)
    
    detector.train(data_path)
    
    # Test detection
    test_point = {
        'timestamp': '2023-01-02 14:00',
        'supply_consumption_rate': 5.0,
        'actual_delivery_time': 6.0,
        'expected_delivery_time': 5.0,
        'supplies_used': 300,
        'initial_inventory': 1000,
        'request_frequency': 15
    }
    
    result = detector.detect(test_point)
    
    assert 'is_anomaly' in result
    assert 'anomaly_score' in result
    assert 'features' in result
    
    # Test model saving/loading
    model_path = detector.save(tmp_path)
    loaded = IsolationForestAnomalyDetector.load(model_path)
    assert loaded.model is not None