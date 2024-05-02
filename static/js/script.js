document.addEventListener('DOMContentLoaded', function() {
    // Definiciones de proyección para OpenLayers
    proj4.defs("EPSG:25831", "+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
    ol.proj.proj4.register(proj4);

    // Configuración inicial del mapa
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

    // Manejo del evento de envío del formulario
    var form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        fetchData();
    });

    function fetchData() {
        var ref = document.getElementById('refInput').value;
        var info = document.getElementById('info');
        if (!info) {
            console.error('El elemento #info no se encontró en el DOM.');
            return;
        }

        fetch(`/get_data?ref=${ref}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    info.innerHTML = 'No se encontraron datos.';
                    console.log("Error:", data.error);
                } else {
                    info.innerHTML = `Referencia: ${ref} <br>
                        Dirección: ${data.direccion} <br>
                        Uso: ${data.uso} <br>
                        Superficie: ${data.superficie} m² <br>
                        Año de Construcción: ${data.año_construcción} <br>`;

                    let cleanedAddress = cleanAddress(data.direccion);
                    console.log("Dirección enviada para geocodificación:", cleanedAddress);
                    geocodeAddress(cleanedAddress);
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                info.innerHTML = 'Error en la solicitud.';
            });
    }

    function cleanAddress(address) {
        // Normalizar la dirección: remplazar abreviaturas y eliminar texto no deseado
        let cleanedAddress = address
            .replace(/PZ/g, 'PZA') // Cambiar 'PZ' por 'PZA' para Plaza
            .replace(/STA/g, 'STA') // Mantener 'STA' para Santa, no necesitas cambiarlo si ya está bien
            .replace(/\d{5}/g, '') // Eliminar el código postal
            .replace(/[^\w\s]/g, '') // Eliminar cualquier carácter especial como paréntesis
            .replace(/\s+/g, ' ') // Eliminar espacios extras
            .trim();
    
        // Establecer un formato más específico y simplificado
        return `PZA STA ANNA, 2 TARRAGONA, España`;
    }    


    function geocodeAddress(cleanedAddress) {
        console.log("Dirección enviada para geocodificación:", cleanedAddress);
        fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(cleanedAddress)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    var coords = data[0];
                    var transformedCoords = ol.proj.transform([parseFloat(coords.lon), parseFloat(coords.lat)], 'EPSG:4326', 'EPSG:25831');
                    map.getView().setCenter(transformedCoords);
                    map.getView().setZoom(17);
                    info.innerHTML += `<br>Coordenadas Geocodificadas: Latitud ${coords.lat}, Longitud ${coords.lon}`;
                    console.log("Coordenadas obtenidas y mapa actualizado: Latitud " + coords.lat + ", Longitud " + coords.lon);
                } else {
                    console.log("No se encontraron coordenadas para la dirección proporcionada:", cleanedAddress);
                    info.innerHTML += "<br>No se encontraron coordenadas para la dirección proporcionada.";
                }
            })
            .catch(error => {
                console.error('Geocoding error:', error);
                info.innerHTML += '<br>Error en la geocodificación.';
                console.log("Geocoding error with address:", cleanedAddress);
            });
    }
});
