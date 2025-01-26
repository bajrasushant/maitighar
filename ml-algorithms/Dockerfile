FROM python:3.13.1-bookworm
COPY requirements.txt .
RUN pip install -r requirements.txt

RUN python -m nltk.downloader punkt_tab punkt wordnet

COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
# CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]

