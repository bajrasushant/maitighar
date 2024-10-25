from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
from typing import List, Dict, Union
import traceback

app = Flask(__name__)
CORS(app)

# Load the trained model and vectorizer
try:
    model = joblib.load('sentiment_analysis_model.joblib')
    vectorizer = joblib.load('tfidf_vectorizer.joblib')
except Exception as e:
    print(f"Error loading model: {str(e)}")
    raise

def predict_sentiment(text: str) -> str:
    if pd.isna(text) or not isinstance(text, str) or text.strip() == '':
        return "Neutral"
    vectorized_text = vectorizer.transform([text])
    prediction = model.predict(vectorized_text)[0]
    return prediction

def get_sentiment_score(sentiment: str) -> int:
    sentiment_scores = {
        'Positive': 1,
        'Negative': -1,
        'Neutral': 0
    }
    return sentiment_scores.get(sentiment, 0)

def analyze_post_sentiment(post_description: str, comments: List[str]) -> Dict[str, Union[str, List[str], float]]:
    # Ensure post_description is a string
    post_description = str(post_description) if post_description is not None else ""
    
    # Analyze post description
    post_sentiment = predict_sentiment(post_description)
    post_score = get_sentiment_score(post_sentiment)
    
    # Ensure comments is a list and remove any None values
    comments = [str(comment) for comment in (comments or []) if comment is not None]
    
    # Analyze comments
    comment_sentiments = [predict_sentiment(comment) for comment in comments if comment.strip()]
    comment_scores = [get_sentiment_score(sentiment) for sentiment in comment_sentiments]
    
    # Calculate average sentiment score
    all_scores = [post_score] + comment_scores
    average_score = sum(all_scores) / len(all_scores) if all_scores else 0
    
    # Determine overall sentiment based on average score
    if average_score > 0.3:
        overall_sentiment = 'Positive'
    elif average_score < -0.3:
        overall_sentiment = 'Negative'
    else:
        overall_sentiment = 'Neutral'
    
    return {
        'post_sentiment': post_sentiment,
        'comment_sentiments': comment_sentiments,
        'average_score': average_score,
        'overall_sentiment': overall_sentiment
    }

@app.route('/test', methods=['GET'])
def health_check():
    """test endpoint to verify if the service is running"""
    return jsonify({
        'status': 'working',
        'message': 'Sentiment analysis service is running'
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """Main endpoint for sentiment analysis"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        post_description = data.get('post_description')
        comments = data.get('comments', [])
        
        if not post_description:
            return jsonify({'error': 'Post description is required'}), 400
            
        result = analyze_post_sentiment(post_description, comments)
        return jsonify(result)
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)