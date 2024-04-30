from flask import Flask, jsonify, request, render_template
import requests
import xmltodict
import pycatastro
from lib.pycatastro import PyCatastro

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_data', methods=['GET'])
def get_data():
    referencia_catastral = request.args.get('ref')
    provincia = "TARRAGONA"  # Asegúrate de usar valores válidos aquí
    municipio = "BELLVEI"  # Asegúrate de usar valores válidos aquí
    try:
        print(f"Solicitando datos para RC: {referencia_catastral}")
        result = PyCatastro.Consulta_DNPRC(provincia=provincia, municipio=municipio, rc=referencia_catastral)
        print(f"Respuesta recibida: {result}")
        if 'Localizacion' in result:
            coord_x = result['Localizacion']['Coordenada_X']
            coord_y = result['Localizacion']['Coordenada_Y']
            data = {
                "coord_x": coord_x,
                "coord_y": coord_y
            }
        else:
            data = {"error": "No se encontraron datos para la referencia proporcionada."}
        return jsonify(data)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
