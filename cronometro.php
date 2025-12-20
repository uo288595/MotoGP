<?php

require_once 'php/Cronometro.php';

session_start();


if (!isset($_SESSION['cronometro'])) {
    $_SESSION['cronometro'] = new Cronometro();
}

$cronometro = $_SESSION['cronometro'];
$mensaje = "";


if (isset($_POST['arrancar'])) {
    $cronometro->arrancar();
    $mensaje = "Cronómetro arrancado.";
}

if (isset($_POST['parar'])) {
    $cronometro->parar();
    $mensaje = "Cronómetro detenido.";
}

if (isset($_POST['mostrar'])) {
    $mensaje = "Tiempo: " . $cronometro->mostrar();
}

?>
<!DOCTYPE HTML>
<html lang="es">

<head>
    <!-- Datos que describen el documento -->
    <meta charset="UTF-8" />
    <title>MotoGP-CronometroPHP</title>
    <meta name="author" content="Carlos Cabrera Moral"/>
    <meta name="description" content="Juego de cronómetro en PHP"/>
    <meta name ="keywords" content ="índice, motoGP, juego, cronómetro, tiempo, segundos, prueba, desafío, php" />
    <meta name ="viewport" content ="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="estilo/layout.css" />
    <link rel="icon" href="multimedia/icon.ico" />
</head>

<body>
    <header>
        <h1><a href="index.html" title="Índice de MotoGP-Desktop">MotoGP Desktop</a></h1>
        <nav>
            <a href="index.html" title="Índice de MotoGP-Desktop">Inicio</a>
            <a href="piloto.html" title="Información del piloto">Piloto</a>
            <a href="circuito.html" title="Información del circuito">Circuito</a>
            <a href="meteorologia.html" title="Información sobre la meteorologia">Meteorología</a>
            <a href="clasificaciones.php" title="Información sobre las clsasificaciones del piloto">Clasificaciones</a>
            <a href="juegos.html" title="Juegos y pasatiempos">Juegos</a>
            <a href="ayuda.html" title="Ayuda de MotoGP-Desktop">Ayuda</a>
        </nav>
    </header>

    <p>Estás en: <a href="index.html" title="Índice de MotoGP-Desktop">Inicio</a> >> <a href="juegos.html" title="Juegos y pasatiempos">Juegos</a> >> <strong>Cronómetro PHP</strong></p>

    <h2>Cronómetro en PHP</h2>

    <form method="post">
        <button type="submit" name="arrancar">Arrancar</button>
        <button type="submit" name="parar">Parar</button>
        <button type="submit" name="mostrar">Mostrar tiempo</button>
    </form>

    <?php if ($mensaje !== ""): ?>
        <p><strong><?php echo $mensaje; ?></strong></p>
    <?php endif; ?>

</body>
</html>
