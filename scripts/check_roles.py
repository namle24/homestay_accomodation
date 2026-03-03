import sqlite3

conn = sqlite3.connect('homestay.db')
cursor = conn.cursor()
cursor.execute("SELECT id, email, role FROM users")
rows = cursor.fetchall()
for row in rows:
    print(row)
conn.close()
