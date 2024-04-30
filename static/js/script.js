// Definición de una nueva proyección si es necesario
proj4.defs("EPSG:25831", "+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
ol.proj.proj4.register(proj4);

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.transform([1.564078, 41.216261], 'EPSG:4326', 'EPSG:25831'), // Transforma las coordenadas de lon/lat a UTM
        zoom: 12
    })
});

function fetchData() {
    var ref = document.getElementById('refInput').value;
    fetch(`/get_data?ref=${ref}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('info').innerHTML = 'No se encontraron datos.';
            } else {
                if (data.coordenadas && data.coordenadas.lon && data.coordenadas.lat) {
                    var coords = ol.proj.transform([parseFloat(data.coordenadas.lon), parseFloat(data.coordenadas.lat)], 'EPSG:4326', 'EPSG:25831');
                    map.getView().setCenter(coords);
                    map.getView().setZoom(17);
                    document.getElementById('info').innerHTML = `Referencia: ${data.referencia} <br>
                        Coordenadas: Latitud ${data.coordenadas.lat}, Longitud ${data.coordenadas.lon} <br>
                        Superficie: ${data.superficie} m²`;
                } else {
                    document.getElementById('info').innerHTML = 'Los datos recibidos no incluyen coordenadas válidas.';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('info').innerHTML = 'Error en la solicitud.';
        });
}
