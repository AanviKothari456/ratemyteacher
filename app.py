from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
#CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
CORS(app)


conn = sqlite3.connect('teachers.db', check_same_thread=False)
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS teachers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, grade INTEGER, subject TEXT)''')
c.execute('''CREATE TABLE IF NOT EXISTS ratings (id INTEGER PRIMARY KEY AUTOINCREMENT, teacher_id INTEGER, score INTEGER, comment TEXT)''')
conn.commit()



@app.route('/add_teacher', methods=['POST'])
def add_teacher():
    data = request.get_json()
    c.execute('INSERT INTO teachers (name, grade, subject) VALUES (?, ?, ?)', (data['name'], data['grade'], data['subject']))
    conn.commit()
    return '', 200

@app.route('/rate_teacher', methods=['POST'])
def rate_teacher():
    data = request.get_json()
    c.execute('INSERT INTO ratings (teacher_id, score, comment) VALUES (?, ?, ?)', (data['teacher_id'], data['score'], data['comment']))
    conn.commit()
    return '', 200

@app.route('/teachers', methods=['GET'])
def get_teachers():
    c.execute('SELECT * FROM teachers')
    teachers = c.fetchall()
    result = []
    for t in teachers:
        c.execute('SELECT AVG(score) FROM ratings WHERE teacher_id = ?', (t[0],))
        avg = c.fetchone()[0]
        result.append({"id": t[0], "name": t[1], "grade": t[2], "subject": t[3], "avg_rating": avg})
    return jsonify(result)


@app.route('/teacher_comments', methods=['GET'])
def teacher_comments():
    query = request.args.get('q', '').lower()
    c.execute('SELECT * FROM teachers')
    teachers = c.fetchall()

    for t in teachers:
        if query in t[1].lower():
            teacher_id = t[0]
            c.execute('SELECT comment FROM ratings WHERE teacher_id = ?', (teacher_id,))
            comments = c.fetchall()
            return jsonify({
                'teacher': t[1],
                'comments': [r[0] for r in comments if r[0].strip() != '']
            })

    return jsonify({'teacher': None, 'comments': []})
from flask import send_from_directory
import os

from flask import send_from_directory
import os

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists("client/build/" + path):
        return send_from_directory('client/build', path)
    else:
        return send_from_directory('client/build', 'index.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)
