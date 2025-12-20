class Cronometro {
    #tiempo;
    #corriendo;
    #inicio;
    #elementoDisplay;

    constructor(selectorDisplay) {
        this.#tiempo = 0;
        this.#corriendo = null;
        this.#inicio = null;
        this.#elementoDisplay = document.querySelector(selectorDisplay);
        
        if (!this.#elementoDisplay) {
            console.error(`No se encontró el elemento con selector: ${selectorDisplay}`);
        }
    }

    #actualizar() {
        try {
            const ahora = Temporal.Now.instant();
            this.#tiempo = ahora.since(this.#inicio).total('millisecond');
        } catch (error) {
            const ahora = new Date();
            this.#tiempo = ahora.getTime() - this.#inicio.getTime();
        }
        this.#mostrar();
    }

    #mostrar() {
        if (!this.#elementoDisplay) return;

        const totalSegundos = Math.floor(this.#tiempo / 1000);
        const minutos = Math.floor(totalSegundos / 60);
        const segundos = totalSegundos % 60;
        const decimas = Math.floor((this.#tiempo % 1000) / 100);

        const formato = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}.${decimas}`;
        this.#elementoDisplay.textContent = formato;
    }

    arrancar() {
        if (this.#corriendo) return; // Evitar múltiples intervalos

        try {
            this.#inicio = Temporal.Now.instant();
        } catch (error) {
            this.#inicio = new Date();
        }
        this.#corriendo = setInterval(() => this.#actualizar(), 100);
    }

    parar() {
        if (this.#corriendo) {
            clearInterval(this.#corriendo);
            this.#corriendo = null;
        }
    }

    reiniciar() {
        this.parar();
        this.#tiempo = 0;
        this.#mostrar();
    }

    get tiempoActual() {
        return this.#tiempo;
    }
}

// Inicialización encapsulada
class ControladorCronometro {
    #cronometro;

    constructor() {
        this.#inicializar();
    }

    #inicializar() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#configurar());
        } else {
            this.#configurar();
        }
    }

    #configurar() {
        this.#cronometro = new Cronometro('main p');
        this.#registrarEventos();
    }

    #registrarEventos() {
        const botones = document.querySelectorAll('main button');
        
        if (botones.length >= 3) {
            botones[0].addEventListener('click', () => this.#cronometro.arrancar());
            botones[1].addEventListener('click', () => this.#cronometro.parar());
            botones[2].addEventListener('click', () => this.#cronometro.reiniciar());
        } 
    }
}

// Instancia única del controlador
const controladorCronometro = new ControladorCronometro();