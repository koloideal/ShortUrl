from flask import Flask, jsonify, g, request, redirect, abort
import database
import string, random, sqlite3

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dsl!f32jjcv6@joizj2%#23jn23xcvh34nf'


@app.get("/")
def index():
    return app.send_static_file("index.html")

@app.get("/health")
def health_check():
    return jsonify({"status" : "ok"}), 200

#создание случайной строки

def generate_random_code(length=7):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@app.post("/api/links")
def create_shortlinks():

# Обработка исключений

    if not request.json:
        return jsonify({
  "error": {
    "code": "invalid_json",
    "message": "Тело запроса не является корректным JSON"
  }
}), 400

    data = request.get_json()
    target_url = data.get('url')
    
    if not data.startswith('http://', 'https://'):
        return jsonify({
  "error": {
    "code": "invalid_url",
    "message": "Введите корректный URL с протоколом http или https"
  }
}), 422

    if not target_url or not isinstance(target_url, str):
        return jsonify({
  "error": {
    "code": "invalid_url",
    "message": "Поле `url` отсутствует или не прошло валидацию"
  }
}), 422

# формирование и возврат ответа

    db = database.get_db()
    cursor = db.cursor()
    code = generate_random_code()
    short_url = f"http://localhost:8000/{code}"

    try:
        cursor.execute(
            "INSERT INTO links (code, short_url, target_url) VALUES (?, ?, ?)", 
            (code, short_url, target_url))
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({
  "error": {
    "code": "internal_error",
    "message": "Внутренняя ошибка сервиса"
  }
}),500
    
    return jsonify({
        "code": code,
        "short_url": short_url,
        "target_url": target_url
    }), 201

@app.teardown_appcontext
def close_connection(exception):
    database.close_db(exception)
