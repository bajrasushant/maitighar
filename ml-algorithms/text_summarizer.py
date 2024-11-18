import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize, sent_tokenize
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

class TextSummarizer:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def preprocess_text(self, text):
        text = text.lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        words = word_tokenize(text)
        words = [self.lemmatizer.lemmatize(word) for word in words if word not in self.stop_words]
        return ' '.join(words)

    def get_sentence_scores(self, text):
        sentences = sent_tokenize(text)
        processed_sentences = [self.preprocess_text(sentence) for sentence in sentences]
        tfidf_matrix = self.vectorizer.fit_transform(processed_sentences)
        sentence_scores = [(sentences[i], np.mean(tfidf_matrix[i].toarray())) for i in range(len(sentences))]
        return sentence_scores

    def summarize(self, text, num_sentences=1):
        if not text:
            return ""
        sentence_scores = self.get_sentence_scores(text)
        sentence_scores.sort(key=lambda x: x[1], reverse=True)
        selected_sentences = [sentence[0] for sentence in sentence_scores[:num_sentences]]
        original_sentences = sent_tokenize(text)
        final_sentences = [sent for sent in original_sentences if sent in selected_sentences]
        return ' '.join(final_sentences)
