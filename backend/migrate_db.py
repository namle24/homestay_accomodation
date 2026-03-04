import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "homestay.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all current dates
cursor.execute("SELECT id, start_date, end_date FROM bookings;")
rows = cursor.fetchall()

# Simple migration:
# start_date (Check in default 14:00)
# end_date (Check out default 12:00)
for row in rows:
    booking_id = row[0]
    start_date = row[1]
    end_date = row[2]
    
    # Check if they are already datetime (contain 'T' or space)
    if ' ' not in start_date and 'T' not in start_date:
        new_start = f"{start_date} 14:00:00.000000+00:00"
        new_end = f"{end_date} 12:00:00.000000+00:00"
        
        cursor.execute(
            "UPDATE bookings SET start_date = ?, end_date = ? WHERE id = ?",
            (new_start, new_end, booking_id)
        )

conn.commit()

cursor.execute("SELECT id, start_date, end_date FROM bookings LIMIT 5;")
new_rows = cursor.fetchall()
print("Updated Sample data (Time injected):")
for row in new_rows:
    print(row)

conn.close()
print("Migration completed successfully.")
