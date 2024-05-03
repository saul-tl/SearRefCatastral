// Array para almacenar los datos de los activos
var activos = [];

// Función para agregar los datos de un activo al array
function agregarActivo(referencia, direccion, uso, superficie, anoConstruccion, municipio, provincia, coords) {
    var activo = {
        referencia: referencia,
        direccion: direccion,
        uso: uso,
        superficie: superficie,
        anoConstruccion: anoConstruccion,
        municipio: municipio,
        provincia: provincia,
        coords: coords
    };
    activos.push(activo);
}


// Función para descargar los datos de los activos en formato Excel
function descargarExcel() {
    if (activos.length === 0) {
        console.error("No hay datos de activos para descargar.");
        return;
    }

    // Crear el contenido del archivo Excel
    var cabeceras = ["Referencia", "Dirección", "Uso", "Superficie", "Año de construcción", "Coordenadas", "Localidad", "Provincia"];
    var contenido = cabeceras.join("\t") + "\n";

    // Agregar los datos de los activos al contenido
    activos.forEach(function(activo) {
        // Verificar si las coordenadas son null antes de intentar acceder a sus propiedades
        var coordsStr = activo.coords ? `${activo.coords.lat}, ${activo.coords.lon}` : ''; // Si las coordenadas son null, se establece una cadena vacía
        contenido += `${activo.referencia}\t${activo.direccion}\t${activo.uso}\t${activo.superficie}\t${activo.anoConstruccion}\t${coordsStr}\t${activo.localidad}\t${activo.provincia}\n`;
    });

    // Crear el archivo Excel
    var blob = new Blob([contenido], { type: "application/vnd.ms-excel" });
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "activos.xlsx";
    link.click();
}