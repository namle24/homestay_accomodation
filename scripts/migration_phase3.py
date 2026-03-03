import sqlite3

def upgrade_db():
    conn = sqlite3.connect('homestay.db')
    cursor = conn.cursor()
    
    print("Upgrading database...")
    
    # 1. Add amenities to rooms
    try:
        cursor.execute("ALTER TABLE rooms ADD COLUMN amenities JSON")
        print("Added 'amenities' column to 'rooms' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("'amenities' column already exists in 'rooms'.")
        else:
            print(f"Error adding 'amenities' to 'rooms': {e}")

    # 2. Add phone_number to bookings
    try:
        cursor.execute("ALTER TABLE bookings ADD COLUMN phone_number VARCHAR(20)")
        print("Added 'phone_number' column to 'bookings' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("'phone_number' column already exists in 'bookings'.")
        else:
            print(f"Error adding 'phone_number' to 'bookings': {e}")
            
    conn.commit()
    conn.close()
    print("Database upgrade completed.")

if __name__ == "__main__":
    upgrade_db()
