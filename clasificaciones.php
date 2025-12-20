<?php
session_start();

    class Clasificacion {

        private $documento;
        private $xml;

        public function __construct()
        {
            $this->documento = "xml/circuitoEsquema.xml";
            $this->xml = null;
        }

        public function consultar() {
            $datos = file_get_contents($this->documento);
            if ($datos == null) {
                echo "<p>Error en el archivo XML recibido.</p>";
                return;
            } 

            $this->xml = simplexml_load_string($datos);
        }

        public function getGanador() {
            if ($this->xml == null) {
                return "XML no cargado";
            }

            $cadena = (string) $this->xml->vencedorYTiempo;
            $partes = explode(" - ", $cadena);

            return $partes[0];
        }

        public function getTiempo() {
            if ($this->xml == null) {
                return "XML no cargado";
            }

            $cadena = (string) $this->xml->vencedorYTiempo;
            $partes = explode(" - ", $cadena);

            return $partes[1];
        }

        public function getClasificados() {
            if ($this->xml == null) {
                return array();
            }

            $pilotos = array();
            if (isset($this->xml->clasificados) && isset($this->xml->clasificados->piloto)) {
                foreach ($this->xml->clasificados->piloto as $piloto) {
                    $pilotos[] = (string) $piloto;
                }
            }

            return $pilotos;
        }
    }

    $clasificacion = new Clasificacion();
    $clasificacion->consultar();
?>

<!DOCTYPE HTML>

<html lang="es">

<head>
    <!-- Datos que describen el documento -->
    <meta charset="UTF-8" />
    <title>MotoGP-Clasificaciones</title>
    <meta name="author" content="Carlos Cabrera Moral"/>
    <meta name="description" content="Información sobre las calificaciones del piloto"/>
    <meta name ="keywords" content ="índice, motoGP" />
    <meta name ="viewport" content ="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="estilo/layout.css" />
    <link rel="icon" href="multimedia/icon.ico" />
</head>

<body>
    <header>
        <h1><a href="index.html" title="MotoGP Desktop">MotoGP Desktop</a></h1>
        <nav>
            <a href="index.html" title="Índice de MotoGP-Desktop">Inicio</a>
            <a href="piloto.html" title="Información del piloto">Piloto</a>
            <a href="circuito.html" title="Información del circuito">Circuito</a>
            <a href="meteorologia.html" title="Información sobre la meteorologia">Meteorología</a>
            <a href="clasificaciones.php" title="Información sobre las clasificaciones del piloto" class="active">Clasificaciones</a>
            <a href="juegos.html" title="Juegos y pasatiempos">Juegos</a>
            <a href="ayuda.html" title="Ayuda de MotoGP-Desktop">Ayuda</a>
        </nav>
    </header>

    <!-- Migas de navegación -->
    <p>Estás en: <a href="index.html" title="Inicio">Inicio</a> >> <strong>Clasificaciones</strong></p>

    <h2>Clasificaciones de MotoGP-Desktop</h2>
    
    <section>
        <h3>Ganador de la carrera</h3>

        <p><strong>Nombre:</strong> 
            <?php echo $clasificacion->getGanador(); ?>
        </p>

        <p><strong>Tiempo empleado:</strong> 
            <?php echo $clasificacion->getTiempo(); ?>
        </p>
    </section>

    <section>
        <h3>Clasificación Final</h3>
        
        <?php 
            $pilotos = $clasificacion->getClasificados();
            if (count($pilotos) > 0) {
                echo "<ol>";
                foreach ($pilotos as $index => $piloto) {
                    echo "<li>" . htmlspecialchars($piloto) . "</li>";
                }
                echo "</ol>";
            } else {
                echo "<p>No hay pilotos clasificados registrados.</p>";
            }
        ?>
    </section>
</body>

</html>