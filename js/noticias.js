class Noticias {
    
    #busqueda;
    #url;
    #apiKey;
    #noticias;

    constructor(busqueda) {
        if (typeof fetch === 'undefined') {
            console.error("fetch() no está disponible en este navegador.");
            alert("Tu navegador no soporta fetch(). Por favor, actualiza tu navegador.");
            return;
        }

        if (typeof busqueda !== 'string' || busqueda.trim() === '') {
            console.error('El término de búsqueda debe ser una cadena no vacía');
            busqueda = "MotoGP";
        }

        this.#busqueda = busqueda.trim();
        this.#url = "https://api.thenewsapi.com/v1/news/all";
        this.#apiKey = "40OgMfvmQ05goSaVpUQsxDBmzjahCVCl01SIETIC";
        this.#noticias = [];
    }

    #construirURL() {
        const parametros = new URLSearchParams({
            api_token: this.#apiKey,
            search: this.#busqueda,
            language: "es",
            limit: 10,
            sort: "published_at"
        });

        return `${this.#url}?${parametros.toString()}`;
    }

    #buscar() {
        if (typeof fetch === 'undefined') {
            console.error("fetch() no disponible");
            return Promise.reject("fetch no disponible");
        }

        const urlCompleta = this.#construirURL();
        console.log("Realizando petición a:", urlCompleta);

        return fetch(urlCompleta)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Datos de noticias recibidos:", data);
                this.#procesarInformacion(data);
                return data; // Retornar los datos para encadenar
            })
            .catch(error => {
                console.error("Error al obtener noticias:", error);
                throw error;
            });
    }

    #procesarInformacion(datos) {
        if (!datos || !datos.data) {
            console.error("No se encontraron datos en la respuesta");
            return;
        }

        if (!Array.isArray(datos.data) || datos.data.length === 0) {
            console.warn("No se encontraron noticias para el término de búsqueda");
            return;
        }

        this.#noticias = [];
        datos.data.forEach((noticia, index) => {
            const noticiaInfo = {
                uuid: noticia.uuid || `noticia-${index}`,
                titulo: noticia.title || "Sin título",
                descripcion: noticia.description || "Sin descripción",
                snippet: noticia.snippet || noticia.description || "Sin contenido",
                url: noticia.url || "#",
                imagenUrl: noticia.image_url || null,
                fuente: noticia.source || "Fuente desconocida",
                fecha: noticia.published_at || null,
                categorias: noticia.categories || [],
                idioma: noticia.language || "es"
            };

            this.#noticias.push(noticiaInfo);
        });

        console.log(`Se procesaron ${this.#noticias.length} noticias`);
        console.log("Metadatos de la respuesta:", {
            encontradas: datos.meta?.found || 0,
            devueltas: datos.meta?.returned || 0,
            limite: datos.meta?.limit || 0,
            pagina: datos.meta?.page || 1
        });

        console.log("Noticias procesadas:", this.#noticias);

        // En el siguiente paso mostraremos las noticias
    }

    get busqueda() {
        return this.#busqueda;
    }

    get url() {
        return this.#url;
    }

    get noticias() {
        return this.#noticias;
    }

    cambiarBusqueda(nuevaBusqueda) {
        if (typeof nuevaBusqueda !== 'string' || nuevaBusqueda.trim() === '') {
            console.error('El término de búsqueda debe ser una cadena no vacía');
            return;
        }
        this.#busqueda = nuevaBusqueda.trim();
    }

    iniciarBusqueda() {
        return this.#buscar();
    }
}

class ControladorNoticias {
    #noticias;
    #contenedor;

    constructor(busqueda = "MotoGP") {
        this.#noticias = new Noticias(busqueda);
        this.#contenedor = null;
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
        console.log("Controlador de noticias inicializado");
        console.log("Término de búsqueda:", this.#noticias.busqueda);
        
        this.#contenedor = document.querySelector('main');
        
        // Esperar a que la búsqueda termine antes de mostrar
        this.#noticias.iniciarBusqueda()
            .then(() => this.#mostrarNoticias())
            .catch(error => console.error("Error en búsqueda:", error));
    }

    #mostrarNoticias() {
        if (!this.#contenedor) {
            console.error("No se encontró el contenedor para mostrar noticias");
            return;
        }

        const noticiasArray = this.#noticias.noticias;
        
        if (!Array.isArray(noticiasArray) || noticiasArray.length === 0) {
            console.warn("No hay noticias para mostrar");
            const aviso = document.createElement('p');
            aviso.textContent = 'No se encontraron noticias.';
            this.#contenedor.appendChild(aviso);
            return;
        }

        // Crear sección para las noticias
        const seccionNoticias = document.createElement('section');

        // Crear encabezado
        const encabezado = document.createElement('h2');
        encabezado.textContent = 'Últimas noticias sobre MotoGP';
        seccionNoticias.appendChild(encabezado);

        // Crear artículos para cada noticia
        noticiasArray.forEach((noticia) => {
            const articulo = document.createElement('article');

            // Titular con enlace
            const titulo = document.createElement('h3');
            const enlaceTitulo = document.createElement('a');
            enlaceTitulo.href = noticia.url;
            enlaceTitulo.target = '_blank';
            enlaceTitulo.rel = 'noopener noreferrer';
            enlaceTitulo.textContent = noticia.titulo;
            titulo.appendChild(enlaceTitulo);
            articulo.appendChild(titulo);

            // Descripción (entradilla)
            const entradilla = document.createElement('p');
            entradilla.textContent = noticia.snippet || noticia.descripcion;
            articulo.appendChild(entradilla);

            // Fuente y fecha
            const footer = document.createElement('footer');

            const fuente = document.createElement('small');
            fuente.textContent = `Fuente: ${noticia.fuente}`;
            footer.appendChild(fuente);

            if (noticia.fecha) {
                const fecha = document.createElement('p');
                fecha.datetime = noticia.fecha;
                const fechaFormato = new Date(noticia.fecha).toLocaleDateString('es-ES');
                fecha.textContent = fechaFormato;
                footer.appendChild(fecha);
            }

            articulo.appendChild(footer);

            // Enlace "Leer más"
            const enlace = document.createElement('a');
            enlace.href = noticia.url;
            enlace.target = '_blank';
            enlace.rel = 'noopener noreferrer';
            enlace.textContent = 'Leer más';
            articulo.appendChild(enlace);

            seccionNoticias.appendChild(articulo);
        });

        this.#contenedor.appendChild(seccionNoticias);

        console.log(`Se mostraron ${noticiasArray.length} noticias en el DOM`);
    }

    get noticias() {
        return this.#noticias;
    }
}

const controladorNoticias = new ControladorNoticias("MotoGP campeonato mundial");