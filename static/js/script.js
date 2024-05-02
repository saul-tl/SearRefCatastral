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
            center: ol.proj.fromLonLat([1.564078, 41.216261]),
            zoom: 12
        })
    });

    var vectorSource = new ol.source.Vector(); // Fuente para el marcador
    var vectorLayer = new ol.layer.Vector({ source: vectorSource }); // Capa para el marcador
    map.addLayer(vectorLayer); // Añade la capa al mapa

    // Manejo del evento de envío del formulario
    var form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        fetchData();
    });

    function fetchData() {
        var ref = document.getElementById('refInput').value;
        var provincia = document.getElementById('provinciaInput').value;
        var municipio = document.getElementById('municipioInput').value;
        var info = document.getElementById('info');
        fetch(`/get_data?ref=${ref}&provincia=${provincia}&municipio=${municipio}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    info.innerHTML = 'No se encontraron datos.';
                    console.log("Error:", data.error);
                } else {
                    let cleanedAddress = cleanAddress(data.direccion, provincia, municipio);
                    console.log("Dirección enviada para geocodificación:", cleanedAddress);
                    geocodeAddress(cleanedAddress);
                    info.innerHTML = `Referencia: ${ref} <br>
                        Dirección: ${cleanedAddress} <br>
                        Uso: ${data.uso} <br>
                        Superficie: ${data.superficie} m² <br>
                        Año de Construcción: ${data.año_construcción} <br>`;
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                info.innerHTML = 'Error en la solicitud.';
            });
    }        

    function cleanAddress(address, provincia, municipio) {
        // Normalizar abreviaturas comunes y eliminar términos específicos
        let cleanedAddress = address
            .replace(/\bPZ\b/g, 'Plaza')
            .replace(/\bSTA\b/g, 'Santa')
            .replace(/\bAV\b/g, 'Avenida')
            .replace(/\bCL\b/g, 'C')            
            .replace(/\bPSEO\b/g, 'Paseo')
            .replace(/\bCTRA\b/g, 'Carretera')
            .replace(/\bPLZ\b/g, 'Plaza')
            .replace(/\bJDN\b/g, 'Jardín')
            .replace(/\bALMD\b/g, 'Alameda')
            .replace(/\bBLVR\b/g, 'Bulevar')
            .replace(/\bGTA\b/g, 'Glorieta')
            .replace(/\bGR\b/g, 'Gran')            
            .replace(/\([^()]*\)/g, '')  // Eliminar texto entre paréntesis
            .replace(/Bl:\d+\s*/gi, '')
            .replace(/Es:[^ ]+\s*/gi, '')
            .replace(/Pl:\d+\s*/gi, '')
            .replace(/Pt:\d+\s*/gi, '')
            .replace(/P-\d+\s*/gi, '')
            .replace(/[^\w\s,]/g, '')  // Eliminar caracteres especiales excepto comas
            .replace(/\s+/g, ' ')  // Reducir múltiples espacios a uno solo
            .trim();
    
        // Eliminar duplicados y detalles no deseados
        let parts = cleanedAddress.split(' ');
        let seen = new Set();
        let uniqueParts = [];
    
        parts.forEach(part => {
            let normalizedPart = part.toLowerCase();
            if (!seen.has(normalizedPart) && part !== provincia && normalizedPart !== municipio.toLowerCase()) {
                seen.add(normalizedPart);
                uniqueParts.push(part);
            }
        });
    
        cleanedAddress = uniqueParts.join(' ');
    
        // Añadir provincia y país si no están presentes
        if (!cleanedAddress.includes(provincia)) {
            cleanedAddress += ", " + provincia;
        }
        cleanedAddress += ", España";
    
        return cleanedAddress;
    }    
                        
        
    function geocodeAddress(cleanedAddress) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(cleanedAddress)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    var coords = data[0];
                    var lonLat = [parseFloat(coords.lon), parseFloat(coords.lat)];
                    var transformedCoords = ol.proj.fromLonLat(lonLat);

                    map.getView().setCenter(transformedCoords);
                    map.getView().setZoom(17);

                    vectorSource.clear(); // Remover marcadores anteriores

                    var newMarker = new ol.Feature({
                        geometry: new ol.geom.Point(transformedCoords)
                    });

                    newMarker.setStyle(new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 1], // Centro inferior del icono
                            scale: 0.05, // Ajustar según el tamaño del icono
                            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
                        })
                    }));

                    vectorSource.addFeature(newMarker);
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
            });
    }
});