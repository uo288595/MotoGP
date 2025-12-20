class Carrusel {
    
    #busqueda;
    #actual;
    #maximo;
    #fotos;
    #intervalo;

    constructor(busqueda) {
        this.#busqueda = busqueda;
        this.#actual = 0;
        this.#maximo = 4;
        this.#fotos = [];
        this.#intervalo = null;
    }

    #getFotografias() {
        const flickrAPI = "https://api.flickr.com/services/rest/";
        
        $.ajax({
            url: flickrAPI,
            method: "GET",
            dataType: "json",
            data: {
                method: "flickr.photos.search",
                api_key: "2cdedc36e73bb2b300f9b9f16107de8a",
                tags: this.#busqueda,
                format: "json",
                nojsoncallback: 1,
                per_page: this.#maximo
            },
            success: (data) => {
                console.log("Datos recibidos:", data);
                this.#procesarJSONFotografias(data);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.error("Error en la petición AJAX:", textStatus, errorThrown);
            }
        });
    }

    #procesarJSONFotografias(datos) {
        if (!datos || !datos.photos || !datos.photos.photo) {
            console.error("No se encontraron fotos en la respuesta");
            return;
        }

        this.#fotos = [];

        const fotosRecibidas = datos.photos.photo;
        
        for (let i = 0; i < Math.min(5, fotosRecibidas.length); i++) {
            const foto = fotosRecibidas[i];
            
            const urlFoto = `https://live.staticflickr.com/${foto.server}/${foto.id}_${foto.secret}_z.jpg`;
            
            const infoFoto = {
                url: urlFoto,
                titulo: foto.title,
                id: foto.id
            };
            
            this.#fotos.push(infoFoto);
        }

        console.log(`Se procesaron ${this.#fotos.length} fotografías`);
        
        this.#mostrarFotografias();
    }

    #mostrarFotografias() {
        if (this.#fotos.length === 0) {
            console.error("No hay fotografías para mostrar");
            return;
        }

        const primeraFoto = this.#fotos[this.#actual];

        const articulo = $("<article></article>");

        const encabezado = $("<h2></h2>").text(`Imágenes del circuito de ${this.#busqueda}`);

        const imagen = $("<img/>")
            .attr("src", primeraFoto.url)
            .attr("alt", primeraFoto.titulo);

        articulo.append(encabezado);
        articulo.append(imagen);

        $("main").append(articulo);

        console.log("Primera fotografía mostrada");

        this.#intervalo = setInterval(this.#cambiarFotografia.bind(this), 3000);
    }

    #cambiarFotografia() {
        if (this.#fotos.length === 0) {
            return;
        }

        this.#actual++;

        if (this.#actual >= this.#fotos.length) {
            this.#actual = 0;
        }

        const fotoActual = this.#fotos[this.#actual];

        $("article img")
            .attr("src", fotoActual.url)
            .attr("alt", fotoActual.titulo);

        console.log(`Mostrando foto ${this.#actual + 1} de ${this.#fotos.length}`);
    }

    iniciar() {
        this.#getFotografias();
    }

    detener() {
        if (this.#intervalo) {
            clearInterval(this.#intervalo);
            this.#intervalo = null;
            console.log("Carrusel detenido");
        }
    }
}

class ControladorCarrusel {
    #carrusel;

    constructor(busqueda) {
        this.#carrusel = new Carrusel(busqueda);
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
        this.#carrusel.iniciar();
    }
}

const controladorCarrusel = new ControladorCarrusel("MotoGP");