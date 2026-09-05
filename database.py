import sqlite3
import os
from flask import Flask, request, g

DATABASE = "shorturl.db"
DEBUG = True

def get_db():
    if not hasattr(g, '_database'):
        g.link_db = connect_db()
    return g.link_db

def connect_db():
    conn = sqlite3.connect("shorturl.db")
    conn.row_factory = sqlite3.Row
    return conn

def create_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            short_url TEXT NOT NULL,
            target_url TEXT NOT NULL
            )
        ''')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_code ON links (code)')
        conn.commit()

def close_db(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
