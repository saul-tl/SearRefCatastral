var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([2.1734, 41.3851]),
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
                document.getElementById('info').innerHTML = `Referencia: ${data.referencia} <br>
                    Coordenadas: Latitud ${data.coordenadas.lat}, Longitud ${data.coordenadas.lon} <br>
                    Superficie: ${data.superficie} m²`;
                // Actualizar mapa según los datos
                var coords = ol.proj.fromLonLat([data.coordenadas.lon, data.coordenadas.lat]);
                map.getView().setCenter(coords);
                map.getView().setZoom(17);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('info').innerHTML = 'Error en la solicitud.';
        });
}
