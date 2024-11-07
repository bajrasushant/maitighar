from pymongo import MongoClient
from bson.objectid import ObjectId
import pandas as pd

# MongoDB connection details
MONGO_URI = "mongodb+srv://shrish:ymSuwkliPUCtoL89@maitighar.8hcenvt.mongodb.net/maitighar?retryWrites=true&w=majority&appName=maitighar"  # Replace with your MongoDB URI
DB_NAME = "maitighar"  # Replace with your database name

def connect_to_mongodb():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    return db

def get_issue_data(db):
    issues_collection = db.issues
    comments_collection = db.comments

    issues_data = []

    for issue in issues_collection.find():
        issue_data = {
            "issue_id": str(issue["_id"]),
            "title": issue["title"],
            "description": issue["description"],
            "comments": []
        }

        # Fetch comments for this issue
        for comment_id in issue.get("comments", []):
            comment = comments_collection.find_one({"_id": ObjectId(comment_id)})
            if comment:
                issue_data["comments"].append(comment["description"])

        issues_data.append(issue_data)

    return issues_data

def create_dataframe(issues_data):
    df = pd.DataFrame(issues_data)
    return df

def main():
    db = connect_to_mongodb()
    issues_data = get_issue_data(db)
    df = create_dataframe(issues_data)

    # Print the first few rows of the dataframe
    print(df.head())

    # Save the dataframe to a CSV file
    df.to_csv("issues_and_comments.csv", index=False)
    print("Data saved to issues_and_comments.csv")

if __name__ == "__main__":
    main()