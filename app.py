import os
import sqlite3
import base64
from flask import Flask, render_template, request, jsonify, redirect, url_for

app = Flask(__name__)
DB_FILE = 'invoices.db'

# Initialize SQLite database schema
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # 1. Settings Table (Corporate Branding)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT,
            company_tagline TEXT,
            company_address TEXT,
            company_email TEXT,
            company_phone TEXT,
            show_logo INTEGER,
            style_mode TEXT,
            logo_base64 TEXT
        )
    ''')
    
    # 2. Job Book Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_book (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT,
            client_name TEXT,
            qty REAL,
            desc TEXT,
            unit_price REAL,
            total REAL
        )
    ''')
    
    # 3. Quotes Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quotes (
            job_id TEXT PRIMARY KEY,
            client_name TEXT,
            addr TEXT,
            city TEXT,
            contact TEXT,
            rep_name TEXT,
            date TEXT,
            subtotal REAL
        )
    ''')
    
    # 4. Quote Items Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quote_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_id TEXT,
            qty REAL,
            desc TEXT,
            unit_price REAL,
            total REAL,
            FOREIGN KEY(quote_id) REFERENCES quotes(job_id) ON DELETE CASCADE
        )
    ''')
    
    # Seed default settings if empty
    cursor.execute('SELECT COUNT(*) FROM settings')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO settings (
                company_name, company_tagline, company_address, 
                company_email, company_phone, show_logo, style_mode, logo_base64
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            "Parkvan Calibration (Pvt) Ltd",
            "PRECISION. RELIABILITY. COMPLIANCE.",
            "119 Harare Drive, Hatfield, HARARE",
            "info@parkvan-calibration.co.zw",
            "0778 924 209",
            1,
            "clean",
            "" # Empty by default, allows fallback to standard icon or fallback logo text
        ))
        
    # Seed default Job Book and finalized Quote if empty
    cursor.execute('SELECT COUNT(*) FROM job_book')
    if cursor.fetchone()[0] == 0:
        default_job_id = "01MAS26"
        default_client = "MASIMBA HOLDINGS LIMITED"
        default_items = [
            (default_job_id, default_client, 1.0, "Calibration of 5000 Liter Bowser MFB 005", 150.00, 150.00),
            (default_job_id, default_client, 1.0, "Calibration of flow meter MFB 00575", 75.00, 75.00),
            (default_job_id, default_client, 1.0, "Tank Calibration Of 28000 Liter HMT 003", 350.00, 350.00),
            (default_job_id, default_client, 1.0, "Tank Integrity Test on 28000L (6 Compartment) HMT 003", 300.00, 300.00),
            (default_job_id, default_client, 1.0, "Tank cleaning on 28000L (6 Compartment) HMT 003", 350.00, 350.00),
            (default_job_id, default_client, 1.0, "Supply Commercial Dispenser (Sanki Classic SK52-120LPM)", 9500.00, 9500.00),
            (default_job_id, default_client, 1.0, "1 Installation and Calibration Commercial Pump Dispenser", 150.00, 150.00),
            (default_job_id, default_client, 1.0, "Mileage", 50.00, 50.00)
        ]
        cursor.executemany('''
            INSERT INTO job_book (job_id, client_name, qty, desc, unit_price, total)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', default_items)
        
        # Seed default Quote
        cursor.execute('''
            INSERT INTO quotes (job_id, client_name, addr, city, contact, rep_name, date, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            default_job_id, default_client, "44 Tilbury Road, Willowvale", "Harare", 
            "Natasha", "Upenyu", "2026-04-29", 10925.00
        ))
        
        # Seed default Quote Items
        quote_items_data = [
            (default_job_id, item[2], item[3], item[4], item[5]) for item in default_items
        ]
        cursor.executemany('''
            INSERT INTO quote_items (quote_id, qty, desc, unit_price, total)
            VALUES (?, ?, ?, ?, ?)
        ''', quote_items_data)
        
    conn.commit()
    conn.close()

# Connection Helper
def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# Main Landing HTML routing
@app.route('/')
def index():
    return render_template('index.html')

# API: Brand Settings
@app.route('/api/settings', methods=['GET', 'POST'])
def api_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == 'GET':
        row = cursor.execute('SELECT * FROM settings ORDER BY id DESC LIMIT 1').fetchone()
        conn.close()
        return jsonify(dict(row))
    
    elif request.method == 'POST':
        data = request.json
        cursor.execute('''
            UPDATE settings
            SET company_name = ?,
                company_tagline = ?,
                company_address = ?,
                company_email = ?,
                company_phone = ?,
                show_logo = ?,
                style_mode = ?,
                logo_base64 = ?
            WHERE id = (SELECT id FROM settings ORDER BY id DESC LIMIT 1)
        ''', (
            data.get('company_name'),
            data.get('company_tagline'),
            data.get('company_address'),
            data.get('company_email'),
            data.get('company_phone'),
            1 if data.get('show_logo') else 0,
            data.get('style_mode', 'clean'),
            data.get('logo_base64', '')
        ))
        conn.commit()
        updated_row = cursor.execute('SELECT * FROM settings ORDER BY id DESC LIMIT 1').fetchone()
        conn.close()
        return jsonify(dict(updated_row))

# API: Job Book Retrieval & Creation
@app.route('/api/job-book', methods=['GET', 'POST'])
def api_job_book():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == 'GET':
        rows = cursor.execute('SELECT * FROM job_book ORDER BY id DESC').fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows])
    
    elif request.method == 'POST':
        data = request.json  # Array of entries or single entry
        if isinstance(data, list):
            for item in data:
                cursor.execute('''
                    INSERT INTO job_book (job_id, client_name, qty, desc, unit_price, total)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    item.get('jobID'),
                    item.get('clientName'),
                    item.get('qty', 1),
                    item.get('desc'),
                    item.get('unitPrice', 0),
                    item.get('total', 0)
                ))
        else:
            cursor.execute('''
                INSERT INTO job_book (job_id, client_name, qty, desc, unit_price, total)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data.get('jobID'),
                data.get('clientName'),
                data.get('qty', 1),
                data.get('desc'),
                data.get('unitPrice', 0),
                data.get('total', 0)
            ))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Logged successfully to Job Book"})

# API: Finalized Quotes Management
@app.route('/api/quotes', methods=['GET', 'POST'])
def api_quotes():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == 'GET':
        quotes_rows = cursor.execute('SELECT * FROM quotes ORDER BY date DESC').fetchall()
        quotes_list = []
        for q_row in quotes_rows:
            job_id = q_row['job_id']
            items_rows = cursor.execute('SELECT * FROM quote_items WHERE quote_id = ?', (job_id,)).fetchall()
            q_dict = dict(q_row)
            # Match standard structure
            q_dict['details'] = {
                'jobID': job_id,
                'clientName': q_row['client_name'],
                'addr': q_row['addr'],
                'city': q_row['city'],
                'contact': q_row['contact'],
                'repName': q_row['rep_name'],
                'date': q_row['date']
            }
            q_dict['items'] = [
                {
                    'id': str(item['id']),
                    'qty': item['qty'],
                    'desc': item['desc'],
                    'unitPrice': item['unit_price'],
                    'total': item['total']
                } for item in items_rows
            ]
            q_dict['id'] = job_id
            quotes_list.append(q_dict)
        conn.close()
        return jsonify(quotes_list)
        
    elif request.method == 'POST':
        data = request.json
        details = data.get('details', {})
        items = data.get('items', [])
        job_id = details.get('jobID')
        
        # 1. Update/Insert Quote Header
        cursor.execute('''
            INSERT INTO quotes (job_id, client_name, addr, city, contact, rep_name, date, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(job_id) DO UPDATE SET
                client_name=excluded.client_name,
                addr=excluded.addr,
                city=excluded.city,
                contact=excluded.contact,
                rep_name=excluded.rep_name,
                date=excluded.date,
                subtotal=excluded.subtotal
        ''', (
            job_id,
            details.get('clientName'),
            details.get('addr'),
            details.get('city'),
            details.get('contact'),
            details.get('repName'),
            details.get('date'),
            sum(i.get('total', 0) for i in items)
        ))
        
        # Delete existing line items for conflict resolution
        cursor.execute('DELETE FROM quote_items WHERE quote_id = ?', (job_id,))
        
        # 2. Insert items
        for item in items:
            cursor.execute('''
                INSERT INTO quote_items (quote_id, qty, desc, unit_price, total)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                job_id,
                item.get('qty', 1),
                item.get('desc'),
                item.get('unitPrice', 0),
                item.get('total', 0)
            ))
            
        # 3. Log values to Job Book as worksheet log entries
        # Check if they are already logged to avoid double entries
        count_existing = cursor.execute('SELECT COUNT(*) FROM job_book WHERE job_id = ?', (job_id,)).fetchone()[0]
        if count_existing == 0:
            for item in items:
                cursor.execute('''
                    INSERT INTO job_book (job_id, client_name, qty, desc, unit_price, total)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    job_id,
                    details.get('clientName'),
                    item.get('qty', 1),
                    item.get('desc'),
                    item.get('unitPrice', 0),
                    item.get('total', 0)
                ))
                
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "id": job_id})

@app.route('/api/quotes/<job_id>', methods=['DELETE'])
def delete_quote(job_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM quotes WHERE job_id = ?', (job_id,))
    cursor.execute('DELETE FROM quote_items WHERE quote_id = ?', (job_id,))
    cursor.execute('DELETE FROM job_book WHERE job_id = ?', (job_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": f"Deleted Quote and jobs with ID: {job_id}"})


if __name__ == '__main__':
    init_db()
    # Runs locally on standard port 5000, can run inside cloud environment on 3000
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Python Local Server at: http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
