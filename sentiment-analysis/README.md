# Sentiment Analysis Service

This folder provides a sentiment analysis service using Flask. It includes a pre-trained sentiment analysis model and a TF-IDF vectorizer.

## Setup

### Prerequisites

- Python 3.x
- `pip` (Python package installer)

### Create and Activate Virtual Environment

1. **Install the virutalenv package:**

   ```sh
   pip install virtualenv
   ```

2. **Create a virtual environment:**

   ```
   virtualenv venv
   ```

3. **Activate the virtual environment:**

- On Windows:

  ```
  venv\Scripts\activate
  ```

- On Linux/macOS:
  ```
  source venv/bin/activate
  ```

4. **Install Dependencies**

   ```
   cd sentiment-analysis
   pip install -r requirements.txt
   ```

5. **Run the Flask Application**
   ```
   python app.py
   ```
   The application will start running on http://127.0.0.1:5000.
