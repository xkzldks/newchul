from pymongo import MongoClient

# db
client = MongoClient('mongodb://test:test@mongo', 27017)
db = client.jjch
