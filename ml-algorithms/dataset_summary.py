import pandas as pd
import os

# Step 1: Locate the file
# If you know the exact name of the file, use os.walk to search for it
def find_file(file_name, start_dir='.'):
    for root, dirs, files in os.walk(start_dir):
        if file_name in files:
            return os.path.join(root, file_name)
    return None

# Provide the name of your dataset file
training_file_name = "twitter_training.csv"  # Replace with your training dataset file name
validation_file_name = "twitter_validation.csv"  # Replace with your validation dataset file name

training_file_path = find_file(training_file_name)
validation_file_path = find_file(validation_file_name)

if training_file_path and validation_file_path:
    print(f"Training file located at: {training_file_path}")

    # Step 2: Read the CSV files
    training_data = pd.read_csv(training_file_path, header=None, names=['ID', 'Text', 'Sentiment', 'Comment'])
    validation_data = pd.read_csv(validation_file_path, header=None, names=['ID', 'Text', 'Sentiment', 'Comment'])

    # Step 3: Get total number of data points
    total_training_data = len(training_data)
    total_validation_data = len(validation_data)

    # Step 4: Count unique sentiment classes
    training_sentiments = training_data['Sentiment'].value_counts()
    training_classes = training_data['Sentiment'].unique()
    validation_sentiments = validation_data['Sentiment'].value_counts()
    validation_classes = training_data['Sentiment'].unique()

    print(f"Total number of training data points: {total_training_data}")
    print(f"Unique sentiment classes in training data: {list(training_classes)}")
    print("Training Data Sentiment Distribution:")
    for sentiment, count in training_sentiments.items():
        print(f"  {sentiment}: {count}")

    print(f"\nValidation file located at: {validation_file_path}")
    print(f"Total number of validation data points: {total_validation_data}")
    print(f"Unique sentiment classes in validation data: {list(validation_classes)}")
    print("Validation Data Sentiment Distribution:")
    for sentiment, count in validation_sentiments.items():
        print(f"  {sentiment}: {count}")
else:
    print("File(s) not found. Please ensure the file names and paths are correct.")
