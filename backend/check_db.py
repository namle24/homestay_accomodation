import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "homestay.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check table schema
cursor.execute("PRAGMA table_info(bookings);")
columns = cursor.fetchall()
print("Current columns in bookings:")
for col in columns:
    print(col)

cursor.execute("SELECT id, start_date, end_date FROM bookings LIMIT 5;")
rows = cursor.fetchall()
print("\nSample existing data:")
for row in rows:
    print(row)

conn.close()
