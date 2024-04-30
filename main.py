from flask import Flask, jsonify, request, render_template
import requests

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_data', methods=['GET'])
def get_data():
    referencia_catastral = request.args.get('ref')
    url = "https://api.catastro.com/detalles"  # Asumiendo una URL ficticia
    params = {'ref': referencia_catastral}
    respuesta = requests.get(url, params=params)
    if respuesta.status_code == 200:
        datos = respuesta.json()
        return jsonify(datos)
    else:
        return jsonify({"error": "No se encontraron datos"}), 404

if __name__ == '__main__':
    app.run(debug=True)
