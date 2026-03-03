import sqlite3

def upgrade_db():
    conn = sqlite3.connect('homestay.db')
    cursor = conn.cursor()
    
    print("Upgrading database for Phase 4...")
    
    # Add notes to bookings
    try:
        cursor.execute("ALTER TABLE bookings ADD COLUMN notes VARCHAR(1000)")
        print("Added 'notes' column to 'bookings' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("'notes' column already exists in 'bookings'.")
        else:
            print(f"Error adding 'notes' to 'bookings': {e}")
            
    conn.commit()
    conn.close()
    print("Database upgrade completed.")

if __name__ == "__main__":
    upgrade_db()
