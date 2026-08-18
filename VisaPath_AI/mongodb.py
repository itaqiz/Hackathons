from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))

db = client["VisaPath"]

users = db["users"]
roadmaps = db["roadmaps"]
progress = db["progress"]