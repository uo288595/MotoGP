class Circuito {
    
    #soportaApiFile;
    #archivoHTML;
    #datosCircuito;

    constructor() {
        
        if (typeof jQuery === 'undefined' || typeof $ === 'undefined') {
            console.error("jQuery no está cargado.");
            alert("Error: jQuery no está disponible.");
            return;
        }

        this.#soportaApiFile = false;
        this.#archivoHTML = null;
        this.#datosCircuito = {};
        this.#comprobarApiFile();

        document.querySelector('#archivoCircuito')?.addEventListener('change', (evento) => {
            this.#leerArchivoHTML(evento);
        });
    }

    #comprobarApiFile() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            console.log("El navegador soporta la API File");
            this.#soportaApiFile = true;
        } else {
            console.error("La API File no es soportada por este navegador");
            this.#soportaApiFile = false;
            this.#mostrarMensajeError();
        }
    }

    #mostrarMensajeError() {
        const $main = $('main');
        
        if ($main.length > 0) {
            const $mensajeError = $('<p></p>')
                .text("Error: Tu navegador no soporta la API File. No podrás cargar archivos locales. Por favor, actualiza tu navegador.");
            
            $main.append($mensajeError);
        }
    }

    #leerArchivoHTML(evento) {
        const archivo = evento.target.files[0];
        
        if (!archivo) {
            console.warn("No se seleccionó ningún archivo");
            return;
        }

        if (!archivo.name.endsWith('.html')) {
            alert("Por favor, selecciona un archivo HTML válido");
            console.error("El archivo no es HTML:", archivo.name);
            return;
        }

        const lector = new FileReader();

        lector.onload = (eventoLectura) => {
            const contenidoHTML = eventoLectura.target.result;            
            this.#archivoHTML = contenidoHTML;
            this.#procesarArchivoHTML(contenidoHTML);
        };
        lector.readAsText(archivo);
    }

    #procesarArchivoHTML(contenidoHTML) {        
        const parser = new DOMParser();
        const doc = parser.parseFromString(contenidoHTML, 'text/html');
        
        const dl = doc.querySelector('dl');
        
        if (dl) {
            const dts = dl.querySelectorAll('dt');
            const dds = dl.querySelectorAll('dd');
            
            for (let i = 0; i < dts.length; i++) {
                const clave = dts[i].textContent.trim();
                const valor = dds[i].textContent.trim();
                this.#datosCircuito[clave] = valor;
            }
        }
        
        this.#mostrarInformacionConJQuery(doc);
    }

    #mostrarInformacionConJQuery(docHTML) {
        const $main = $('main');
        const $seccionInfo = $('<section></section>');
        const $titulo = $('<h3></h3>').text('Información del Circuito');

        $seccionInfo.append($titulo);
        
        const $dl = $('<dl></dl>');
        
        const etiquetas = {
            'nombre': 'Nombre',
            'longitudCircuito': 'Longitud del circuito (m)',
            'anchura': 'Anchura (m)',
            'fecha': 'Fecha',
            'horaEsp': 'Hora (ESP)',
            'numeroVueltas': 'Número de vueltas',
            'localidadProxima': 'Localidad próxima',
            'pais': 'País',
            'patrocinador': 'Patrocinador',
            'vencedorYTiempo': 'Vencedor y tiempo'
        };
        
        $.each(this.#datosCircuito, (clave, valor) => {
            const $dt = $('<dt></dt>').text(etiquetas[clave] || clave);
            const $dd = $('<dd></dd>').text(valor);
            
            $dl.append($dt).append($dd);
        });
        
        $seccionInfo.append($dl);
        
        // --- SECCIÓN: Referencias ---
        const referencias = $(docHTML).find('section:has(h2:contains("Referencias"))');        
        if (referencias.length > 0) {
            const $seccionRef = $('<section></section>');
            const $tituloRef = $('<h3></h3>').text('Referencias');
            $seccionRef.append($tituloRef);
            
            const $ul = $('<ul></ul>');
            
            $(referencias).find('a').each(function() {
                const $enlace = $(this);
                const $li = $('<li></li>');
                const $nuevoEnlace = $('<a></a>')
                    .attr('href', $enlace.attr('href'))
                    .attr('target', '_blank')
                    .text($enlace.attr('href'));
                
                $li.append($nuevoEnlace);
                $ul.append($li);
            });
            
            $seccionRef.append($ul);
            $main.append($seccionRef);
        }
        
        // --- SECCIÓN: Galería de Fotos ---
        const galeriaFotos = $(docHTML).find('section:has(h2:contains("fotos"))');
        
        if (galeriaFotos.length > 0) {
            const $seccionFotos = $('<section></section>');
            const $tituloFotos = $('<h3></h3>').text('Galería de fotos');
            $seccionFotos.append($tituloFotos);
        
            const imagenes = $(galeriaFotos).find('img');
            
            if (imagenes.length > 0) {
                imagenes.each(function() {
                    const $imgOriginal = $(this);
                    const srcOriginal = $imgOriginal.attr('src');
                    
                    const rutaCorregida = srcOriginal.replace('../', '');
                    
                    const $figure = $('<figure></figure>');
                    
                    const $img = $('<img>')
                        .attr('src', rutaCorregida)
                        .attr('alt', $imgOriginal.attr('alt') || 'Imagen del circuito');
        
                    const $figcaption = $('<figcaption></figcaption>');
                    const figcaptionOriginal = $imgOriginal.next('figcaption');
                    if (figcaptionOriginal.length > 0) {
                        $figcaption.text(figcaptionOriginal.text());
                    } else {
                        $figcaption.text($imgOriginal.attr('alt') || 'Foto del circuito');
                    }
                    
                    $figure.append($img).append($figcaption);
                    $seccionFotos.append($figure);
                });
            } else {
                const $mensaje = $('<p></p>')
                    .text('No se encontraron imágenes en el archivo.');
                $seccionFotos.append($mensaje);
            }
            
            $main.append($seccionFotos);
        }
        
        // --- SECCIÓN: Galería de Videos ---
        const galeriaVideos = $(docHTML).find('section:has(h2:contains("videos"))');
        
        if (galeriaVideos.length > 0) {
            const $seccionVideos = $('<section></section>');
            const $tituloVideos = $('<h3></h3>').text('Galería de videos');
            $seccionVideos.append($tituloVideos);
            
            const videos = $(galeriaVideos).find('video');
            
            if (videos.length > 0) {
                videos.each(function() {
                    const $videoOriginal = $(this);
                    
                    const $video = $('<video></video>')
                        .attr('controls', 'controls');
                    
                    const sources = $videoOriginal.find('source');
                    
                    if (sources.length > 0) {
                        sources.each(function() {
                            const $sourceOriginal = $(this);
                            const srcOriginal = $sourceOriginal.attr('src');
                            const type = $sourceOriginal.attr('type');
                            
                            const rutaCorregida = srcOriginal.replace('../', '');
                            
                            const $source = $('<source>')
                                .attr('src', rutaCorregida)
                                .attr('type', type);
                            
                            $video.append($source);
                        });
                        
                        $video.append('Tu navegador no soporta el elemento video.');
                        
                        $seccionVideos.append($video);
                    } else {
                        const srcVideo = $videoOriginal.attr('src');
                        if (srcVideo) {
                            const rutaCorregida = srcVideo.replace('../', '');
                            $video.attr('src', rutaCorregida);
                            $video.append('Tu navegador no soporta el elemento video.');
                            $seccionVideos.append($video);
                        }
                    }
                });
            } else {
                const $mensaje = $('<p></p>')
                    .text('No se encontraron videos en el archivo.');
                $seccionVideos.append($mensaje);
            }
            
            $main.append($seccionVideos);
        }
        
        // --- SECCIÓN: Clasificados ---
        const clasificados = $(docHTML).find('section:has(h2:contains("Clasificados"))');
        
        if (clasificados.length > 0) {
            const $seccionClasificados = $('<section></section>');
            const $tituloClasificados = $('<h3></h3>').text('Clasificados');
            $seccionClasificados.append($tituloClasificados);
            
            const $ol = $('<ol></ol>');
            
            $(clasificados).find('ol li').each(function() {
                const $li = $('<li></li>').text($(this).text());
                $ol.append($li);
            });
            
            $seccionClasificados.append($ol);
            $main.append($seccionClasificados);
        }
        
        const $primerSeccion = $main.find('section:first');
        $seccionInfo.insertAfter($primerSeccion);
    }

    get soportaApiFile() {
        return this.#soportaApiFile;
    }

    get archivoHTML() {
        return this.#archivoHTML;
    }

    get datosCircuito() {
        return this.#datosCircuito;
    }
}

class CargadorSVG {
    
    #soportaApiFile;
    #archivoSVG;

    constructor() {
        if (typeof jQuery === 'undefined' || typeof $ === 'undefined') {
            console.error("jQuery no está cargado.");
            alert("Error: jQuery no está disponible.");
            return;
        }

        this.#soportaApiFile = false;
        this.#archivoSVG = null;
        this.#comprobarApiFile();

        document.querySelector('#archivoSVG')?.addEventListener('change', (evento) => {
            this.#leerArchivoSVG(evento);
        });
    }

    #comprobarApiFile() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            console.log("El navegador soporta la API File para SVG");
            this.#soportaApiFile = true;
        } else {
            console.error("La API File no es soportada por este navegador");
            this.#soportaApiFile = false;
            this.#mostrarMensajeError();
        }
    }

    #mostrarMensajeError() {
        const $main = $('main');
        
        if ($main.length > 0) {
            const $mensajeError = $('<p></p>')
                .text("Error: Tu navegador no soporta la API File. No podrás cargar archivos SVG.");
            
            $main.append($mensajeError);
        }
    }

    #leerArchivoSVG(evento) {
        const archivo = evento.target.files[0];
        
        if (!archivo) {
            console.warn("No se seleccionó ningún archivo SVG");
            return;
        }

        if (!archivo.name.endsWith('.svg')) {
            alert("Por favor, selecciona un archivo SVG válido");
            console.error("El archivo no es SVG:", archivo.name);
            return;
        }

        console.log("Archivo SVG seleccionado:", archivo.name);
        console.log("Tamaño:", archivo.size, "bytes");
        console.log("Tipo:", archivo.type);

        const lector = new FileReader();

        lector.onload = (eventoLectura) => {
            const contenidoSVG = eventoLectura.target.result;            
            this.#archivoSVG = contenidoSVG;            
            this.#insertarSVG(contenidoSVG);
        };
        lector.readAsText(archivo);
    }

    #insertarSVG(contenidoSVG) {
        console.log("Insertando SVG en el documento...");
        
        const $contenedorSVG = $('#contenedor-svg');
        
        if ($contenedorSVG.length === 0) {
            console.error("No se encontró el contenedor para el SVG");
            return;
        }

        $contenedorSVG.empty();

        const parser = new DOMParser();
        const docSVG = parser.parseFromString(contenidoSVG, 'image/svg+xml');
        
        $contenedorSVG.append(docSVG.documentElement);
        
        console.log("SVG insertado correctamente en el documento");
        
        const $caption = $('<figcaption></figcaption>')
            .text(`Perfil de altimetría`);
        
        $contenedorSVG.append($caption);
    }

    get soportaApiFile() {
        return this.#soportaApiFile;
    }

    get archivoSVG() {
        return this.#archivoSVG;
    }
}

class CargadorKML {
    #soportaApiFile;
    #archivoKML;

    constructor() {
        this.#soportaApiFile = false;
        this.#archivoKML = null;
        this.#comprobarApiFile();

        document.querySelector('#archivoKML')?.addEventListener('change', (evento) => {
            this.#leerArchivoKML(evento);
        });
    }

    #comprobarApiFile() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            console.log("El navegador soporta la API File para KML");
            this.#soportaApiFile = true;
        } else {
            console.error("La API File no es soportada por este navegador");
            this.#soportaApiFile = false;
            this.#mostrarMensajeError();
        }
    }

    #mostrarMensajeError() {
        const $main = $('main');
        
        if ($main.length > 0) {
            const $mensajeError = $('<p></p>')
                .text("Error: Tu navegador no soporta la API File. No podrás cargar archivos KML.");
            
            $main.append($mensajeError);
        }
    }


    #leerArchivoKML(evento) {
        const archivo = evento.target.files[0];
        
        if (!archivo) {
            console.warn("No se seleccionó ningún archivo KML");
            return;
        }

        if (!archivo.name.endsWith('.kml')) {
            alert("Por favor, selecciona un archivo KML válido");
            console.error("El archivo no es KML:", archivo.name);
            return;
        }

        console.log("Archivo KML seleccionado:", archivo.name);
        console.log("Tamaño:", archivo.size, "bytes");
        console.log("Tipo:", archivo.type);

        const lector = new FileReader();

        lector.onload = (eventoLectura) => {
            const contenidoKML = eventoLectura.target.result;
            
            console.log("Archivo KML leído correctamente");
            console.log("Longitud del contenido:", contenidoKML.length, "caracteres");
            
            this.#archivoKML = contenidoKML;
            
            // Parsear y extraer coordenadas
            this.#extraerCoordenadas(contenidoKML);
        };

        lector.onerror = (error) => {
            console.error("Error al leer el archivo KML:", error);
            alert("Error al leer el archivo KML. Por favor, inténtalo de nuevo.");
        };

        lector.onprogress = (eventoProgreso) => {
            if (eventoProgreso.lengthComputable) {
                const porcentaje = (eventoProgreso.loaded / eventoProgreso.total) * 100;
                console.log(`Leyendo archivo KML: ${porcentaje.toFixed(2)}%`);
            }
        };

        lector.readAsText(archivo);
    }

    #extraerCoordenadas(contenidoKML) {
        const parser = new DOMParser();
        const docKML = parser.parseFromString(contenidoKML, 'text/xml');
        
        const errorNode = docKML.querySelector('parsererror');
        if (errorNode) {
            console.error("Error al parsear el KML:", errorNode.textContent);
            alert('Error al procesar el archivo KML. Asegúrate de que sea un archivo KML válido.');
            return;
        }

        const coordinatesElement = docKML.querySelector('LineString > coordinates');
        
        if (!coordinatesElement) {
            console.error("No se encontraron coordenadas en el archivo KML");
            alert('No se encontraron coordenadas en el archivo KML.');
            return;
        }

        const coordinatesText = coordinatesElement.textContent.trim();
        const coordenadas = coordinatesText.split('\n')
            .map(coord => coord.trim())
            .filter(coord => coord.length > 0)
            .map(coord => {
                const [lon, lat, alt] = coord.split(',');
                return {
                    longitude: parseFloat(lon),
                    latitude: parseFloat(lat),
                    altitude: parseFloat(alt)
                };
            });

        this.#insertarCapaKML(coordenadas);
    }

    #insertarCapaKML(coordenadas) {
        console.log("Insertando capa KML en el mapa dinámico...");
        
        const $contenedorKML = $('#contenedor-kml');
        
        if ($contenedorKML.length === 0) {
            console.error("No se encontró el contenedor para el KML");
            return;
        }

        $contenedorKML.empty();
        const $divMapa = $('<div></div>')
            .attr('id', 'mapa-circuito');
        $contenedorKML.append($divMapa);

        // Verificar que hay coordenadas
        if (!coordenadas || coordenadas.length === 0) {
            console.error("No hay coordenadas para mostrar en el mapa");
            return;
        }

        // APIKEY
        mapboxgl.accessToken = 'pk.eyJ1IjoidW8yODg1OTUiLCJhIjoiY21penR6dDBnMDFqazNkc2ZrdHBqeGcyYSJ9.-2p8GzBIYRsfyw1whS1lXQ'; // Reemplazar con token real

        const puntoOrigen = coordenadas[0];
        const mapa = new mapboxgl.Map({
            container: 'mapa-circuito',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [puntoOrigen.longitude, puntoOrigen.latitude],
            zoom: 14
        });

        // Esperar a que el mapa cargue
        mapa.on('load', () => {
            // Punto de origen
            const markerElement = document.createElement('div');
            markerElement.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMS42IDAgOCA0LjMgOCA5LjZDOCAxNi41IDEwLjggMjYgMTYgMzUuNkMyMS4yIDI2IDI0IDE2LjUgMjQgOS42QzI0IDQuMyAyMC40IDAgMTYgMFoiIGZpbGw9IiNGRjAwMDAiLz48L3N2Zz4=)';
            markerElement.style.backgroundSize = '100%';
            markerElement.style.width = '32px';
            markerElement.style.height = '32px';
            markerElement.style.cursor = 'pointer';

            new mapboxgl.Marker({ element: markerElement })
                .setLngLat([puntoOrigen.longitude, puntoOrigen.latitude])
                .setPopup(new mapboxgl.Popup().setHTML(`
                    <h4>Punto de Origen</h4>
                    <p><strong>Longitud:</strong> ${puntoOrigen.longitude.toFixed(6)}</p>
                    <p><strong>Latitud:</strong> ${puntoOrigen.latitude.toFixed(6)}</p>
                    <p><strong>Altitud:</strong> ${puntoOrigen.altitude.toFixed(2)} m</p>
                `))
                .addTo(mapa);


            const coordenadasLinea = coordenadas.map(coord => 
                [coord.longitude, coord.latitude]
            );

            // Agregar fuente GeoJSON para la polilínea
            mapa.addSource('circuito-ruta', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': coordenadasLinea
                    }
                }
            });
            mapa.addLayer({
                'id': 'circuito-ruta-layer',
                'type': 'line',
                'source': 'circuito-ruta',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#000080',
                    'line-width': 4,
                    'line-opacity': 0.8
                }
            });

            const limites = coordenadas.reduce((bounds, coord) => {
                return bounds.extend([coord.longitude, coord.latitude]);
            }, new mapboxgl.LngLatBounds(
                [puntoOrigen.longitude, puntoOrigen.latitude],
                [puntoOrigen.longitude, puntoOrigen.latitude]
            ));

            mapa.fitBounds(limites, { padding: 50 });

            setTimeout(() => mapa.resize(), 200);
        });
    }

    get soportaApiFile() {
        return this.#soportaApiFile;
    }

    get archivoKML() {
        return this.#archivoKML;
    }
}

class ControladorCircuito {
    #circuito;

    constructor() {
        this.#inicializar();
    }

    #inicializar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#configurar());
        } else {
            this.#configurar();
        }
    }

    #configurar() {
        console.log("Controlador de circuito inicializado");
        this.#circuito = new Circuito();
        
        if (this.#circuito.soportaApiFile) {
            console.log("API File disponible. Listo para cargar archivos.");
        } else {
            console.error("API File no disponible. Funcionalidad limitada.");
        }
    }

    get circuito() {
        return this.#circuito;
    }
}

class ControladorCargadorSVG {
    #cargadorSVG;

    constructor() {
        this.#inicializar();
    }

    #inicializar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#configurar());
        } else {
            this.#configurar();
        }
    }

    #configurar() {
        console.log("Controlador de CargadorSVG inicializado");
        this.#cargadorSVG = new CargadorSVG();
        
        if (this.#cargadorSVG.soportaApiFile) {
            console.log("API File disponible para SVG. Listo para cargar archivos.");
        } else {
            console.error("API File no disponible para SVG.");
        }
    }

    get cargadorSVG() {
        return this.#cargadorSVG;
    }
}

class ControladorCargadorKML {
    #cargadorKML;

    constructor() {
        this.#inicializar();
    }

    #inicializar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#configurar());
        } else {
            this.#configurar();
        }
    }

    #configurar() {
        console.log("Controlador de CargadorKML inicializado");
        this.#cargadorKML = new CargadorKML();

        if (this.#cargadorKML.soportaApiFile) {
            console.log("API File disponible para KML. Listo para cargar archivos.");
        } else {
            console.error("API File no disponible para KML.");
        }
    }

    get cargadorKML() {
        return this.#cargadorKML;
    }
}

const controladorCircuito = new ControladorCircuito();
const controladorCargadorSVG = new ControladorCargadorSVG();
const controladorCargadorKML = new ControladorCargadorKML();