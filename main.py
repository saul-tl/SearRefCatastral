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
    provincia = request.args.get('provincia')
    municipio = request.args.get('municipio')
    try:
        print(f"Solicitando datos para RC: {referencia_catastral}, Provincia: {provincia}, Municipio: {municipio}")
        result = PyCatastro.Consulta_DNPRC(provincia=provincia, municipio=municipio, rc=referencia_catastral)
        print(f"Respuesta recibida: {result}")
        
        # Procesamiento de la respuesta similar a antes
        if 'consulta_dnp' in result and 'bico' in result['consulta_dnp']:
            bi = result['consulta_dnp']['bico']['bi']
            direccion = bi['ldt']
            uso = bi['debi']['luso']
            superficie = bi['debi']['sfc']
            año = bi['debi']['ant']
            
            data = {
                "direccion": direccion,
                "uso": uso,
                "superficie": superficie,
                "año_construccion": año
            }
        else:
            data = {"error": "No se encontraron datos para la referencia proporcionada."}
            
        return jsonify(data)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)