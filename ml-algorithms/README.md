# ML Algorithms Service

This folder provides a sentiment analysis and text summarization service using Flask. It includes a pre-trained sentiment analysis and text summariztaion model and a TF-IDF vectorizer.

## Setup

### Prerequisites

- Python 3.x
- `pip` (Python package installer)

### Download Text summarization Dataset from here: https://drive.google.com/drive/folders/12X191nJyELEiNWBexbQ5C0zuCHIj1P-R?usp=sharing

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
   cd ml-algorithms
   pip install -r requirements.txt
   ```

5. **Run the Flask Application**
   ```
   python app.py
   ```
   The application will start running on http://127.0.0.1:5000.
