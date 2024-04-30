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
    try:
        # Usar Consulta_DNPRC para obtener datos a partir de la referencia catastral
        # Asumimos que los datos de provincia y municipio son conocidos o están fijos por ahora
        provincia = "TuProvincia"  # Deberías obtener esto de tu formulario o contexto
        municipio = "TuMunicipio"  # Deberías obtener esto de tu formulario o contexto
        result = PyCatastro.Consulta_DNPRC(provincia=provincia, municipio=municipio, rc=referencia_catastral)
        # Aquí supongo que result tiene la estructura esperada, debes ajustar según lo que devuelva el servicio
        coord_x = result['Localizacion']['Coordenada_X']
        coord_y = result['Localizacion']['Coordenada_Y']
        data = {
            "coord_x": coord_x,
            "coord_y": coord_y
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == '__main__':
    app.run(debug=True)
