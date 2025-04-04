import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
import joblib
import re
import string
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import nltk

nltk.download('stopwords')
nltk.download('wordnet')

class EmergencyMessageProcessor:
    def __init__(self, model_path):
        self.model_path = model_path
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.model = None

    def clean_text(self, text):
        text = text.lower()
        text = re.sub(r'http\S+|www\S+|https\S+', '', text)
        text = re.sub(r'\@\w+|\#', '', text)
        text = text.translate(str.maketrans('', '', string.punctuation))
        tokens = text.split()
        tokens = [self.lemmatizer.lemmatize(word) for word in tokens if word not in self.stop_words]
        return ' '.join(tokens)

    def train_model(self, data_path):
        df = pd.read_csv(data_path)
        df['clean_text'] = df['message'].apply(self.clean_text)
        
        self.model = Pipeline([
            ('tfidf', TfidfVectorizer()),
            ('clf', LinearSVC())
        ])
        
        self.model.fit(df['clean_text'], df['category'])
        joblib.dump(self.model, self.model_path)
        print(f"Model trained and saved to {self.model_path}")

    def predict_category(self, message):
        if not self.model:
            self.model = joblib.load(self.model_path)
        cleaned = self.clean_text(message)
        return self.model.predict([cleaned])[0]

if __name__ == "__main__":
    # ABSOLUTE PATHS - CHANGE ONLY THESE IF NEEDED
    BASE_DIR = r"C:\xampp\htdocs\emergency-optimizer"
    MODEL_PATH = os.path.join(BASE_DIR, "backend/scripts/model-training/nlp/emergency_classifier.joblib")
    DATA_PATH = os.path.join(BASE_DIR, "backend/data/emergency_messages.csv")
    
    # Initialize and train
    processor = EmergencyMessageProcessor(MODEL_PATH)
    
    if not os.path.exists(DATA_PATH):
        print(f"ERROR: Create this file first: {DATA_PATH}")
        print("With content like:\nmessage,category\n\"Need help\",\"medical\"")
    else:
        processor.train_model(DATA_PATH)
        print("\nTest predictions:")
        test_msgs = ["Need medicine", "Food running out", "People trapped"]
        for msg in test_msgs:
            print(f"'{msg}' → {processor.predict_category(msg)}")