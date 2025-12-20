<?php
class Cronometro {
    private $tiempo;
    private $inicio;

    public function __construct() {
        $this->tiempo = 0;
        $this->inicio = null;
    }

    public function arrancar() {
        if ($this->inicio === null) {
            $this->inicio = microtime(true);
        }
    }

    public function parar() {
        if ($this->inicio !== null) {
            $fin = microtime(true);
            $this->tiempo += $fin - $this->inicio;
            $this->inicio = null;
        }
    }

    public function obtenerTiempoTotal() {
        $totalSegundos = $this->tiempo;

        if ($this->inicio !== null) {
            $totalSegundos += microtime(true) - $this->inicio;
        }

        return $totalSegundos;
    }

    public function mostrar() {
        $totalSegundos = $this->obtenerTiempoTotal();

        $minutos = floor($totalSegundos / 60);
        $segundos = $totalSegundos - ($minutos * 60);

        return sprintf("%02d:%04.1f", $minutos, $segundos);
    }
}
?>