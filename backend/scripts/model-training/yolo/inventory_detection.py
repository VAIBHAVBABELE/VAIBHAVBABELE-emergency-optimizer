import os
import cv2
import torch
import yaml
import argparse
from datetime import datetime
from PIL import Image
from ultralytics import YOLO

class InventoryDetector:
    def __init__(self):
        # Full absolute path configuration
        self.base_dir = r'C:\xampp\htdocs\emergency-optimizer'
        self.data_dir = os.path.join(self.base_dir, 'backend', 'data')
        self.model_path = os.path.join(self.base_dir, 'backend', 'scripts', 'model-training', 'yolo', 'inventory_yolov5.pt')
        
        # Model initialization
        self.model = None
        self.class_names = self.load_class_names()
        self.load_model()

    def load_class_names(self):
        """Load class names from data.yaml with full path"""
        yaml_path = os.path.join(self.data_dir, 'yolo_data', 'data.yaml')
        try:
            with open(yaml_path) as f:
                data = yaml.safe_load(f)
            return data['names']
        except Exception as e:
            print(f"Warning: Could not load data.yaml, using default classes. Error: {e}")
            return ['medical_kit', 'food_packet', 'water_bottle', 'blanket', 'first_aid', 'flashlight']

    def load_model(self):
        """Improved model loading with absolute paths"""
        try:
            # Check if custom model exists and is valid
            if os.path.exists(self.model_path) and os.path.getsize(self.model_path) > 1024:
                try:
                    self.model = YOLO(self.model_path)
                    print(f"✓ Loaded custom model from {self.model_path}")
                    return
                except Exception as e:
                    print(f"⚠ Corrupted model file: {e}")
                    os.remove(self.model_path)

            # Download fresh pretrained model
            print("↓ Downloading YOLOv5s pretrained model...")
            self.model = YOLO('yolov5s.pt')
            print("✓ Pretrained model loaded successfully")
            
            # Save a clean copy
            self.model.save(self.model_path)
            print(f"✓ Saved model to {self.model_path}")
            
        except Exception as e:
            print(f"⛔ Critical error: {e}")
            print("Please check:")
            print("1. Internet connection")
            print(f"2. Write permissions for: {os.path.dirname(self.model_path)}")
            print("3. Disk space (need ~100MB free)")
            raise

    def train(self):
        """Train model with full paths"""
        dataset_path = os.path.join(self.data_dir, 'yolo_data')
        yaml_path = os.path.join(dataset_path, 'data.yaml')
        
        if not os.path.exists(yaml_path):
            raise FileNotFoundError(f"data.yaml not found at {yaml_path}")
        
        print(f"Training model using data from {dataset_path}...")
        
        self.model = YOLO('yolov5s.pt')
        self.model.train(
            data=yaml_path,
            epochs=50,
            batch=8,
            imgsz=640,
            device='0' if torch.cuda.is_available() else 'cpu'
        )
        
        self.model.save(self.model_path)
        print(f"Model saved to {self.model_path}")

    def detect(self, img_source):
        """Detect objects with path validation"""
        if not self.model:
            raise RuntimeError("Model not loaded")
        
        # Convert to absolute path if not already
        if isinstance(img_source, str):
            img_source = os.path.join(self.base_dir, img_source) if not os.path.isabs(img_source) else img_source
        
        results = self.model(img_source)
        detections = []
        for result in results:
            for box in result.boxes:
                detections.append({
                    'class': self.class_names[int(box.cls)],
                    'confidence': float(box.conf),
                    'bbox': [int(x) for x in box.xyxy[0].tolist()],
                    'time': datetime.now().isoformat()
                })
        
        return {
            'image_size': results[0].orig_shape,
            'detections': detections,
            'counts': {name: sum(1 for d in detections if d['class'] == name) 
                     for name in self.class_names}
        }

    def visualize(self, img_source, save_path=None):
        """Visualize results with absolute paths"""
        # Handle path conversion
        if isinstance(img_source, str):
            img_source = os.path.join(self.base_dir, img_source) if not os.path.isabs(img_source) else img_source
            img = cv2.imread(img_source)
        else:
            img = img_source
            
        results = self.detect(img_source)
        
        for det in results['detections']:
            x1, y1, x2, y2 = det['bbox']
            label = f"{det['class']} {det['confidence']:.2f}"
            
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.rectangle(img, (x1, y1-20), (x1+len(label)*10, y1), (0, 255, 0), -1)
            cv2.putText(img, label, (x1, y1-5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
        
        if save_path:
            save_path = os.path.join(self.base_dir, save_path) if not os.path.isabs(save_path) else save_path
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            cv2.imwrite(save_path, img)
        else:
            cv2.imshow('Inventory Detection', img)
            cv2.waitKey(0)
            cv2.destroyAllWindows()

def main():
    detector = InventoryDetector()
    
    # Configure paths
    default_img = os.path.join('backend', 'data', 'test_images', 'medical_1.jpg')
    default_output = os.path.join('backend', 'static', 'detection_output.jpg')
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--img-source', type=str,
                      default=default_img,
                      help=f'Path to image file (relative to {detector.base_dir})')
    parser.add_argument('--output', type=str,
                      default=default_output,
                      help=f'Output path for results (relative to {detector.base_dir})')
    parser.add_argument('--train', action='store_true',
                      help='Train the model')
    args = parser.parse_args()

    if args.train:
        detector.train()
        return

    # Convert to absolute paths
    img_path = os.path.join(detector.base_dir, args.img_source)
    output_path = os.path.join(detector.base_dir, args.output)
    
    # Debug paths
    print("\nPath Configuration:")
    print(f"Base directory: {detector.base_dir}")
    print(f"Image path: {img_path}")
    print(f"Output path: {output_path}")
    print(f"Image exists: {os.path.exists(img_path)}")
    
    if not os.path.exists(img_path):
        print(f"\nError: Image not found at {img_path}")
        test_dir = os.path.join(detector.base_dir, 'backend', 'data', 'test_images')
        print("Available test images:")
        if os.path.exists(test_dir):
            for f in os.listdir(test_dir):
                print(f" - {os.path.join(test_dir, f)}")
        else:
            print(f"Test images directory not found at {test_dir}")
        return

    # Process image
    print(f"\nProcessing image: {img_path}")
    results = detector.detect(img_path)
    print("\nDetection Results:")
    print(f"Items detected: {results['counts']}")
    
    detector.visualize(img_path, output_path)
    print(f"\nVisualization saved to: {output_path}")

if __name__ == "__main__":
    main()