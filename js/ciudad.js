class Ciudad {
    
    #nombre;
    #pais;
    #gentilicio;
    #cantidadPoblacion;
    #coordenadas;
    #latitud;
    #longitud;
    #datosEntrenos;
    #datosEntrenosProcesados;

    constructor(nombre, pais, gentilicio) {
        this.#nombre = nombre;
        this.#pais = pais;
        this.#gentilicio = gentilicio;
        this.#cantidadPoblacion = null;
        this.#coordenadas = null;
        this.#latitud = null;
        this.#longitud = null;
        this.#datosEntrenos = null;
        this.#datosEntrenosProcesados = null;
    }

    #crearElemento(tag, contenido, clases = []) {
        const elemento = document.createElement(tag);
        if (contenido) {
            elemento.textContent = contenido;
        }
        clases.forEach(clase => elemento.classList.add(clase));
        return elemento;
    }

    #generarHTMLInfoSecundaria() {
        const ul = document.createElement('ul');
        
        const liGentilicio = document.createElement('li');
        liGentilicio.textContent = `Gentilicio: ${this.#gentilicio}`;
        ul.appendChild(liGentilicio);
        
        const liPoblacion = document.createElement('li');
        liPoblacion.textContent = `Cantidad de población: ${this.#cantidadPoblacion || 'No disponible'}`;
        ul.appendChild(liPoblacion);
        
        return ul;
    }

    #parsearCoordenadas() {
        if (this.#coordenadas) {
            const coords = this.#coordenadas.split(',');
            if (coords.length === 2) {
                this.#latitud = parseFloat(coords[0].trim());
                this.#longitud = parseFloat(coords[1].trim());
            }
        }
    }

    setCantidadPoblacionYCoord(cantidadPoblacion, coordenadas) {
        this.#cantidadPoblacion = cantidadPoblacion;
        this.#coordenadas = coordenadas;
        this.#parsearCoordenadas();
    }

    get nombre() {
        return this.#nombre;
    }

    get pais() {
        return this.#pais;
    }

    get gentilicio() {
        return this.#gentilicio;
    }

    get poblacion() {
        return this.#cantidadPoblacion;
    }

    get coordenadas() {
        return this.#coordenadas;
    }

    #getMeteorologiaCarrera() {
        if (!this.#latitud || !this.#longitud) {
            console.error('No se han establecido las coordenadas');
            return;
        }

        const fechasMeteorologia = ["2025-11-14", "2025-11-15", "2025-11-16"];

        for (const fecha of fechasMeteorologia) {
            this.#obtenerDatosMeteorologicosPorFecha(fecha);
        }
    }

    #obtenerDatosMeteorologicosPorFecha(fecha) {
        const apiURL = "https://archive-api.open-meteo.com/v1/archive";

        $.ajax({
            url: apiURL,
            method: "GET",
            dataType: "json",
            data: {
                latitude: this.#latitud,
                longitude: this.#longitud,
                start_date: fecha,
                end_date: fecha,
                hourly: [
                    "temperature_2m",
                    "apparent_temperature",
                    "rain",
                    "relative_humidity_2m",
                    "windspeed_10m",
                    "winddirection_10m"
                ].join(','),
                daily: [
                    "sunrise",
                    "sunset"
                ].join(','),
                timezone: "Europe/Madrid"
            },
            success: (data) => {
                console.log("Datos meteorológicos recibidos:", data);
                this.#procesarJSONCarrera(data);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.error("Error al obtener datos meteorológicos:", textStatus, errorThrown);
            }
        });
    }

    #procesarJSONCarrera(datos) {
        if (!datos || !datos.hourly || !datos.daily) {
            console.error("No se encontraron datos meteorológicos en la respuesta");
            return;
        }

        const datosDiarios = {
            fecha: datos.daily.time[0],
            amanecer: datos.daily.sunrise[0],
            atardecer: datos.daily.sunset[0]
        };

        const datosHorarios = [];
        
        for (let i = 0; i < datos.hourly.time.length; i++) {
            const hora = datos.hourly.time[i];
            
            const datosHora = {
                hora: hora,
                temperatura: datos.hourly.temperature_2m[i],
                sensacionTermica: datos.hourly.apparent_temperature[i],
                lluvia: datos.hourly.rain[i],
                humedad: datos.hourly.relative_humidity_2m[i],
                velocidadViento: datos.hourly.windspeed_10m[i],
                direccionViento: datos.hourly.winddirection_10m[i]
            };
            
            datosHorarios.push(datosHora);
        }

        console.log("Datos procesados:");
        console.log("Diarios:", datosDiarios);
        console.log("Horarios:", datosHorarios);

        this.#mostrarDatosMeteorologicos(datosDiarios, datosHorarios);
    }

    #mostrarDatosMeteorologicos(datosDiarios, datosHorarios) {
        const seccionMeteo = $("<section></section>");

        const tituloDialios = $("<h3></h3>").text("Información del día");
        seccionMeteo.append(tituloDialios);

        const listaDiarios = $("<ul></ul>");
        
        listaDiarios.append(
            $("<li></li>").text(`Fecha: ${datosDiarios.fecha}`)
        );
        
        listaDiarios.append(
            $("<li></li>").text(`Amanecer: ${new Date(datosDiarios.amanecer).toLocaleTimeString('es-ES')}`)
        );
        
        listaDiarios.append(
            $("<li></li>").text(`Atardecer: ${new Date(datosDiarios.atardecer).toLocaleTimeString('es-ES')}`)
        );

        seccionMeteo.append(listaDiarios);

        const tituloHorarios = $("<h4></h4>").text("Datos meteorológicos por hora");
        seccionMeteo.append(tituloHorarios);

        const listaHora = $("<ul></ul>");

        datosHorarios.forEach((datosHora) => {
            const horaFormateada = new Date(datosHora.hora).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const encabezadoHora = $("<li></li>").html(`<strong>Hora: ${horaFormateada}</strong>`);
            

            const subLista = $("<ul></ul>");
            
            subLista.append(
                $("<li></li>").text(`Temperatura: ${datosHora.temperatura}°C`)
            );
            
            subLista.append(
                $("<li></li>").text(`Sensación térmica: ${datosHora.sensacionTermica}°C`)
            );
            
            subLista.append(
                $("<li></li>").text(`Lluvia: ${datosHora.lluvia} mm`)
            );
            
            subLista.append(
                $("<li></li>").text(`Humedad: ${datosHora.humedad}%`)
            );
            
            subLista.append(
                $("<li></li>").text(`Velocidad del viento: ${datosHora.velocidadViento} km/h`)
            );
            
            subLista.append(
                $("<li></li>").text(`Dirección del viento: ${datosHora.direccionViento}°`)
            );

            encabezadoHora.append(subLista);
            listaHora.append(encabezadoHora);
        });

        seccionMeteo.append(listaHora);

        $("main").append(seccionMeteo);

        console.log("Datos meteorológicos mostrados correctamente");
    }

    mostrarEnContenedor(contenedor) {
        if (!contenedor || !(contenedor instanceof HTMLElement)) {
            console.error('Se requiere un contenedor válido');
            return;
        }

        contenedor.innerHTML = '';
        
        const parrafoCiudad = this.#crearElemento('h2', `Ciudad: ${this.#nombre}`);
        contenedor.appendChild(parrafoCiudad);

        const parrafoPais = this.#crearElemento('p', `País: ${this.#pais}`);
        contenedor.appendChild(parrafoPais);

        const infoSecundaria = this.#generarHTMLInfoSecundaria();
        contenedor.appendChild(infoSecundaria);

        if (this.#coordenadas) {
            const parrafoCoordenadas = this.#crearElemento('p', `Coordenadas: ${this.#coordenadas}`);
            contenedor.appendChild(parrafoCoordenadas);
        }

        this.#getMeteorologiaCarrera();
    }

    getMeteorologiaEntrenos() {
        if (!this.#latitud || !this.#longitud) {
            console.error('No se han establecido las coordenadas');
            return Promise.reject(new Error('No se han establecido las coordenadas'));
        }

        const fechaCarrera = "2024-11-17";
        const carrera = new Date(fechaCarrera);

        const inicio = new Date(carrera);
        inicio.setDate(carrera.getDate() - 3);
        const fin = new Date(carrera);
        fin.setDate(carrera.getDate() - 1);

        const start_date = inicio.toISOString().slice(0, 10);
        const end_date = fin.toISOString().slice(0, 10);

        const apiURL = "https://archive-api.open-meteo.com/v1/archive";
        const hourlyFields = [
            "temperature_2m",
            "rain",
            "windspeed_10m",
            "relative_humidity_2m"
        ].join(',');

        return $.ajax({
            url: apiURL,
            method: "GET",
            dataType: "json",
            data: {
                latitude: this.#latitud,
                longitude: this.#longitud,
                start_date: start_date,
                end_date: end_date,
                hourly: hourlyFields,
                timezone: "Europe/Madrid"
            }
        }).done((data) => {
            console.log("Datos meteorológicos de entrenos recibidos:", data);
            this.#datosEntrenos = data;
            this.#procesarJSONEntrenos(data);
        }).fail((jqXHR, textStatus, errorThrown) => {
            console.error("Error al obtener datos meteorológicos de entrenos:", textStatus, errorThrown);
        });
    }

    #procesarJSONEntrenos(datos) {
        if (!datos || !datos.hourly || !datos.hourly.time) {
            console.error("Objeto JSON de entrenos inválido");
            return null;
        }

        const times = datos.hourly.time || [];
        const temps = datos.hourly.temperature_2m || [];
        const rains = datos.hourly.rain || [];
        const winds = datos.hourly.windspeed_10m || [];
        const hums = datos.hourly.relative_humidity_2m || [];

        const agrupado = {};

        for (let i = 0; i < times.length; i++) {
            const fecha = times[i].slice(0, 10); 
            if (!agrupado[fecha]) {
                agrupado[fecha] = {
                    sumaTemp: 0, cntTemp: 0,
                    sumaRain: 0, cntRain: 0,
                    sumaWind: 0, cntWind: 0,
                    sumaHum: 0, cntHum: 0
                };
            }

            const registro = agrupado[fecha];

            const t = temps[i];
            if (typeof t === 'number' && !isNaN(t)) {
                registro.sumaTemp += t;
                registro.cntTemp++;
            }

            const r = rains[i];
            if (typeof r === 'number' && !isNaN(r)) {
                registro.sumaRain += r;
                registro.cntRain++;
            }

            const w = winds[i];
            if (typeof w === 'number' && !isNaN(w)) {
                registro.sumaWind += w;
                registro.cntWind++;
            }

            const h = hums[i];
            if (typeof h === 'number' && !isNaN(h)) {
                registro.sumaHum += h;
                registro.cntHum++;
            }
        }

        const fechas = Object.keys(agrupado).sort();
        const mediasPorDia = fechas.map((fecha) => {
            const acc = agrupado[fecha];

            const mediaTemp = acc.cntTemp ? Number((acc.sumaTemp / acc.cntTemp).toFixed(2)) : null;
            const mediaRain = acc.cntRain ? Number((acc.sumaRain / acc.cntRain).toFixed(2)) : null;
            const mediaWind = acc.cntWind ? Number((acc.sumaWind / acc.cntWind).toFixed(2)) : null;
            const mediaHum  = acc.cntHum  ? Number((acc.sumaHum  / acc.cntHum).toFixed(2)) : null;

            return {
                fecha,
                temperatura_media_2m: mediaTemp,
                lluvia_media_mm: mediaRain,
                viento_media_kmh: mediaWind,
                humedad_relativa_media_pct: mediaHum
            };
        });

        this.#datosEntrenosProcesados = mediasPorDia;
        console.log("Medias de entrenos por día:", mediasPorDia);

        this.#mostrarDatosEntrenos(mediasPorDia);

        return mediasPorDia;
    }

    #mostrarDatosEntrenos(mediasPorDia) {
        if (!Array.isArray(mediasPorDia) || mediasPorDia.length === 0) {
            console.warn('No hay datos procesados de entrenos para mostrar');
            return;
        }

        const contenedor = $('main section');
        if (contenedor.length === 0) {
            console.error('No se encontró el contenedor en meteorologia.html para mostrar entrenos');
            return;
        }

        const seccionEntrenos = $('<section></section>');
        seccionEntrenos.append($('<h3></h3>').text(`Medias meteorológicas de los entrenamientos previos en ${this.#nombre}`));

        mediasPorDia.forEach(dia => {
            const fechaTitulo = $('<h4></h4>').text(dia.fecha);
            const lista = $('<ul></ul>');

            lista.append($('<li></li>').text(`Temperatura media (2m): ${dia.temperatura_media_2m !== null ? dia.temperatura_media_2m + '°C' : 'No disponible'}`));
            lista.append($('<li></li>').text(`Lluvia media: ${dia.lluvia_media_mm !== null ? dia.lluvia_media_mm + ' mm' : 'No disponible'}`));
            lista.append($('<li></li>').text(`Velocidad media del viento (10m): ${dia.viento_media_kmh !== null ? dia.viento_media_kmh + ' km/h' : 'No disponible'}`));
            lista.append($('<li></li>').text(`Humedad relativa media (2m): ${dia.humedad_relativa_media_pct !== null ? dia.humedad_relativa_media_pct + ' %' : 'No disponible'}`));

            seccionEntrenos.append(fechaTitulo);
            seccionEntrenos.append(lista);
        });

        contenedor.append(seccionEntrenos);
        console.log('Información de entrenos añadida al documento');
    }

    toString() {
        return `${this.#nombre}, ${this.#pais}`;
    }
}

class ControladorCiudad {
    #ciudad;
    #contenedor;

    constructor(datosCiudad) {
        this.#ciudad = new Ciudad(
            datosCiudad.nombre,
            datosCiudad.pais,
            datosCiudad.gentilicio
        );

        if (datosCiudad.poblacion && datosCiudad.coordenadas) {
            this.#ciudad.setCantidadPoblacionYCoord(
                datosCiudad.poblacion,
                datosCiudad.coordenadas
            );
        }

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
        this.#contenedor = document.querySelector('main section');
        
        if (!this.#contenedor) {
            console.error('No se encontró el contenedor para mostrar la información de la ciudad');
            return;
        }

        this.#mostrar();
    }

    #mostrar() {
        this.#ciudad.mostrarEnContenedor(this.#contenedor);
    }

    actualizarDatos(poblacion, coordenadas) {
        this.#ciudad.setCantidadPoblacionYCoord(poblacion, coordenadas);
        this.#mostrar();
    }
}

const controladorCiudad = new ControladorCiudad({
    nombre: "Valencia",
    pais: "España",
    gentilicio: "Valenciano",
    poblacion: 844000,
    coordenadas: "39.4697, -0.3763"
});