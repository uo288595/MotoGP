class Memoria {
    // Atributos privados
    #tableroBloqueado;
    #primeraCarta;
    #segundaCarta;
    #cronometro;

    constructor() {
        this.#tableroBloqueado = false;
        this.#primeraCarta = null;
        this.#segundaCarta = null;
        this.#cronometro = new Cronometro('main p');

        this.#barajarCartas();
        this.#cronometro.arrancar();
    }

    // Métodos privados
    #barajarCartas() {
        const main = document.querySelector('main');
        if (!main) return;

        const cartas = main.querySelectorAll('article');
        const arrayCartas = Array.from(cartas);
        
        for (let i = arrayCartas.length - 1; i > 0; i--) {
            const indiceAleatorio = Math.floor(Math.random() * (i + 1));
            
            const temp = arrayCartas[i];
            arrayCartas[i] = arrayCartas[indiceAleatorio];
            arrayCartas[indiceAleatorio] = temp;
        }

        arrayCartas.forEach(carta => main.appendChild(carta));
    }

    #reiniciarAtributos() {
        this.#tableroBloqueado = false;
        this.#primeraCarta = null;
        this.#segundaCarta = null;
    }

    #deshabilitarCartas() {
        if (!this.#primeraCarta || !this.#segundaCarta) return;
        
        this.#primeraCarta.setAttribute('data-estado', 'revelada');
        this.#segundaCarta.setAttribute('data-estado', 'revelada');

        this.#comprobarJuego();
        this.#reiniciarAtributos();
    }

    #comprobarJuego() {
        const cartas = document.querySelectorAll('main article');
        if (!cartas || cartas.length === 0) return;

        const todasReveladas = Array.from(cartas).every(c => c.dataset.estado === 'revelada');

        if (todasReveladas) {
            this.#tableroBloqueado = true;
            this.#cronometro.parar();
        }
    }

    #cubrirCartas() {
        this.#tableroBloqueado = true;

        setTimeout(() => {
            if (this.#primeraCarta) this.#primeraCarta.removeAttribute('data-estado');
            if (this.#segundaCarta) this.#segundaCarta.removeAttribute('data-estado');

            this.#reiniciarAtributos();
        }, 1500);
    }

    #comprobarPareja() {
        if (!this.#primeraCarta || !this.#segundaCarta) return;

        const img1 = this.#primeraCarta.querySelector('img');
        const img2 = this.#segundaCarta.querySelector('img');

        const valor1 = img1 ? img1.getAttribute('src') : null;
        const valor2 = img2 ? img2.getAttribute('src') : null;

        if (valor1 && valor1 === valor2) {
            this.#deshabilitarCartas();
        } else {
            this.#cubrirCartas();
        }
    }

    voltearCarta(carta) {
        if (!carta || !(carta instanceof HTMLElement)) return;
        if (this.#tableroBloqueado) return;
        
        const estado = carta.dataset.estado;
        if (estado === 'revelada' || estado === 'volteada') return;

        carta.setAttribute('data-estado', 'volteada');

        if (!this.#primeraCarta) {
            this.#primeraCarta = carta;
            return;
        }

        this.#segundaCarta = carta;
        this.#comprobarPareja();
    }
}

class ControladorMemoria {
    #memoria;

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
        this.#memoria = new Memoria();
        this.#registrarEventos();
    }

    #registrarEventos() {
        const cartas = document.querySelectorAll('main > article');
        
        cartas.forEach(carta => {
            carta.addEventListener('click', () => {
                this.#memoria.voltearCarta(carta);
            });
        });
    }
}

const controladorMemoria = new ControladorMemoria();