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
        center: ol.proj.transform([1.564078, 41.216261], 'EPSG:4326', 'EPSG:25831'),
        zoom: 12
    })
});

function fetchData() {
    var ref = document.getElementById('refInput').value;
    fetch(`/get_data?ref=${ref}`)
        .then(response => response.json())
        .then(data => {
            var infoDiv = document.getElementById('info');
            if (data.error) {
                infoDiv.innerHTML = 'No se encontraron datos.';
            } else {
                var coords = [parseFloat(data.coord_x), parseFloat(data.coord_y)];
                var coordsLonLat = ol.proj.transform(coords, 'EPSG:25831', 'EPSG:4326');
                map.getView().setCenter(coords);
                map.getView().setZoom(17);
                infoDiv.innerHTML = `Referencia: ${ref} <br>
                    Coordenadas: Latitud ${coordsLonLat[1].toFixed(5)}, Longitud ${coordsLonLat[0].toFixed(5)} <br>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('info').innerHTML = 'Error en la solicitud.';
        });
}

// Añadir esto si el botón está fuera del formulario o para prevenir recarga de página
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    fetchData();
});
