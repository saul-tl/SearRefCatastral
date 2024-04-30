from flask import Flask, jsonify, request, render_template
import requests
import pycatastro

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_data', methods=['GET'])
def get_data():
    referencia_catastral = request.args.get('ref')
    url = "https://www.catastro.meh.es/ws/esquemas/ovc_consulta_datos_out.xsd"
    params = {
        'RC': referencia_catastral,
        'SRS': 'EPSG:4326'  # Sistema de referencia espacial, por ejemplo.
    }
    headers = {
        'Content-Type': 'application/xml'  # Si es un servicio SOAP.
    }
    respuesta = requests.get(url, params=params, headers=headers)
    if respuesta.status_code == 200:
        return jsonify(respuesta.text)  # Devuelve la respuesta como JSON
    else:
        return jsonify({"error": "No se encontraron datos"}), respuesta.status_code

if __name__ == '__main__':
    app.run(debug=True)
