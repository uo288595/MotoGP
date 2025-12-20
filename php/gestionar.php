<?php
require_once 'Configuracion.php';

$config = new Configuracion();
$message = '';


if (isset($_POST['reiniciar'])) {
    $message = $config->reiniciarBaseDatos();
} elseif (isset($_POST['eliminar'])) {
    $message = $config->deleteBaseDatos();
} elseif (isset($_POST['exportar'])) {
    $message = $config->exportarBaseDatosCSV();
} elseif (isset($_POST['inicializar'])) {
    $message = $config->cargarPreguntas();
}

?>

<!DOCTYPE HTML>

<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>MotoGP-Gestion</title>
    <meta name="author" content="Carlos Cabrera Moral"/>
    <meta name="description" content="Gestión de la base de datos MotoGP"/>
    <meta name="keywords" content="motoGP, moto, base de datos, gestion" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="../estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="../estilo/layout.css" />
    <link rel="icon" href="../multimedia/icon.ico" />
</head>

<body>
    <p>Volver a <a href="../index.html" title="Inicio">Inicio</a></p>

    <main>
        <h2>Gestión de la base de datos MotoGP</h2>
        <form method="post" action="#">
            <input type="submit" name="reiniciar" value="Reiniciar Base de Datos">
            <input type="submit" name="eliminar" value="Eliminar Base de Datos">
            <input type="submit" name="exportar" value="Exportar Base de Datos a CSV">
            <input type="submit" name="inicializar" value="Inicializar Preguntas">
        </form>
        <?php if ($message): ?>
            <p><?php echo $message; ?></p>
        <?php endif; ?>
    </main>
</body>

</html>