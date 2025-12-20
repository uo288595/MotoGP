<?php
require_once 'GestionPrueba.php';
require_once 'Cronometro.php';

session_start();

$mensaje = "";
$error = "";

$gestion = new GestionPrueba();
$preguntas = $gestion->obtenerPreguntas();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['preguntar_datos'])) {
        $profesion = trim($_POST['profesion']);
        $edad = $_POST['edad'];
        $genero = $_POST['genero'];
        $pericia = $_POST['pericia'];
        
        $resultado = $gestion->iniciarPrueba($profesion, $edad, $genero, $pericia);
        
        if (is_numeric($resultado)) {
            $_SESSION['id_usuario'] = $resultado;
            $_SESSION['profesion'] = $profesion;
            $_SESSION['edad'] = $edad;
            $_SESSION['genero'] = $genero;
            $_SESSION['pericia'] = $pericia;
            $_SESSION['paso'] = 'confirmacion';
        } else {
            $error = $resultado;
        }
    } 
    elseif (isset($_POST['editar_datos'])) {
        unset($_SESSION['paso']);
    } 
    elseif (isset($_POST['confirmar_datos'])) {
        $_SESSION['paso'] = 'prueba';
        $_SESSION['cronometro'] = new Cronometro();
        $_SESSION['cronometro']->arrancar();
    } 
    elseif (isset($_POST['terminar_prueba'])) {
        // Validar que todas las preguntas tengan respuesta
        $todasRespondidas = true;
        foreach ($preguntas as $pregunta) {
            $id = $pregunta['id_pregunta'];
            if (empty(trim($_POST["respuesta_$id"]))) {
                $todasRespondidas = false;
                break;
            }
        }
        
        if (!$todasRespondidas) {
            $error = "Por favor, responda todas las preguntas antes de terminar la prueba.";
        } else {
            $_SESSION['cronometro']->parar();
            
            // Guardar respuestas 
            $_SESSION['respuestas'] = [];
            foreach ($preguntas as $pregunta) {
                $id = $pregunta['id_pregunta'];
                $_SESSION['respuestas'][$id] = trim($_POST["respuesta_$id"]);
            }
            
            $_SESSION['completado'] = true;
            $_SESSION['paso'] = 'observaciones';
        }
    } 
    elseif (isset($_POST['abandonar_prueba'])) {
        $_SESSION['cronometro']->parar();
        
        // Guardar respuestas 
        $_SESSION['respuestas'] = [];
        foreach ($preguntas as $pregunta) {
            $id = $pregunta['id_pregunta'];
            $_SESSION['respuestas'][$id] = isset($_POST["respuesta_$id"]) ? trim($_POST["respuesta_$id"]) : "";
        }
        
        $_SESSION['completado'] = false;
        $_SESSION['paso'] = 'observaciones';
    } 
    elseif (isset($_POST['guardar_observaciones'])) {  
        // Obtener datos del formulario de observaciones
        $dispositivo = $_POST['dispositivo'];
        $comentario = trim($_POST['comentario']);
        $propuesta_mejora = trim($_POST['propuesta_mejora']);
        $valoracion = $_POST['valoracion'];
        $observacion_observador = trim($_POST['observacion_observador']);
        $tiempo = $_SESSION['cronometro']->obtenerTiempoTotal();
        
        // Guardar resultado
        $resultado = $gestion->guardarResultado(
            $_SESSION['id_usuario'],
            $dispositivo,
            $tiempo,
            $_SESSION['completado'],
            $comentario,
            $propuesta_mejora,
            $valoracion
        );
        
        // Guardar respuestas 
        foreach ($_SESSION['respuestas'] as $id_pregunta => $respuesta_texto) {
            $gestion->guardarRespuesta(
                $_SESSION['id_usuario'],
                $id_pregunta,
                $respuesta_texto
            );
        }
        
        // Guardar observación
        if (!empty($observacion_observador)) {
            $gestion->guardarObservacion($_SESSION['id_usuario'], $observacion_observador);
        }
        
        // Limpiar sesión
        $_SESSION['paso'] = 'finalizado';
        $mensaje = "Prueba de usabilidad completada y guardada correctamente.";
    }
}

$paso = $_SESSION['paso'] ?? 'inicial';
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
    <main>
        <h1>Prueba de usabilidad</h1>
        
        <section class="formulario-contenedor">
            <?php if (!empty($error)): ?>
                <p class="error"><?php echo htmlspecialchars($error); ?></p>
            <?php endif; ?>
            
            <?php if (!empty($mensaje)): ?>
                <p class="exito"><?php echo htmlspecialchars($mensaje); ?></p>
            <?php endif; ?>
            
            <?php if ($paso === 'inicial'): ?>
                <h2>Datos del participante</h2>
                <p>Por favor, complete sus datos para comenzar la prueba de usabilidad.</p>
                
                <form method="POST" action="#">
                    <fieldset class="campo-formulario">
                        <label for="profesion">Profesión:</label>
                        <input type="text" id="profesion" name="profesion" required 
                               placeholder="Ej: Ingeniero, Estudiante, etc.">
                    </fieldset>
                    
                    <fieldset class="campo-formulario">
                        <label for="edad">Edad:</label>
                        <input type="number" id="edad" name="edad" min="0" max="120" required>
                    </fieldset>
                    
                    <fieldset class="campo-formulario">
                        <label for="genero">Género:</label>
                        <select id="genero" name="genero" required>
                            <option value="">Seleccione una opción</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </fieldset>
                    
                    <fieldset class="campo-formulario">
                        <label for="pericia">Nivel de pericia en tecnología (1-10):</label>
                        <input type="number" id="pericia" name="pericia" min="1" max="10" required>
                        <small>1 = Principiante, 10 = Experto</small>
                    </fieldset>
                    
                    <p class="botones">
                        <button type="submit" name="preguntar_datos" class="boton">Continuar</button>
                    </p>
                </form>
                
            <?php elseif ($paso === 'confirmacion'): ?>
                <h2>Confirmación de datos</h2>

                <section class="confirmacion">
                    <h2>Confirme sus datos</h2>

                    <p><strong>Profesión:</strong> <?php echo htmlspecialchars($_SESSION['profesion']); ?></p>
                    <p><strong>Edad:</strong> <?php echo htmlspecialchars($_SESSION['edad']); ?> años</p>
                    <p><strong>Género:</strong> <?php echo htmlspecialchars($_SESSION['genero']); ?></p>
                    <p><strong>Pericia:</strong> <?php echo htmlspecialchars($_SESSION['pericia']); ?>/10</p>
                </section>
                
                <p>¿Son correctos estos datos? Al confirmar, comenzará la prueba de usabilidad.</p>
                
                <form method="POST" action="#">
                    <p class="botones">
                        <button type="submit" name="editar_datos" class="boton boton-secundario">Editar datos</button>
                        <button type="submit" name="confirmar_datos" class="boton">Iniciar prueba</button>
                    </p>
                </form>
                
            <?php elseif ($paso === 'prueba'): ?>
                <h2>Preguntas de usabilidad</h2>
                
                <section class="instrucciones">
                    <h3>Instrucciones:</h3>
                    <p> Por favor, responda todas las preguntas basándose en su experiencia navegando por la aplicación MotoGP.</p>
                </section>
                
                <form method="POST" action="#" id="formularioPrueba">
                    <?php foreach ($preguntas as $index => $pregunta): ?>
                        <section class="pregunta-item">
                            <h4>Pregunta <?php echo ($index + 1); ?></h4>
                            <fieldset class="campo-formulario">
                                <label for="respuesta_<?php echo $pregunta['id_pregunta']; ?>"><?php echo htmlspecialchars($pregunta['texto']); ?></label>
                                <input type="text" 
                                       id="respuesta_<?php echo $pregunta['id_pregunta']; ?>" 
                                       name="respuesta_<?php echo $pregunta['id_pregunta']; ?>" 
                                       placeholder="Escriba su respuesta aquí">
                            </fieldset>
                        </section>
                    <?php endforeach; ?>
                    
                    <p class="botones">
                        <button type="submit" name="abandonar_prueba" class="boton boton-peligro">Abandonar prueba</button>
                        <button type="submit" name="terminar_prueba" class="boton">Terminar prueba</button>
                    </p>
                </form>
                
            <?php elseif ($paso === 'observaciones'): ?>
                <h2>Observaciones y valoración</h2>
                
                <?php if ($_SESSION['completado']): ?>
                    <p class="exito">El participante ha completado la prueba exitosamente.</p>
                <?php else: ?>
                    <p class="error">El participante ha abandonado la prueba.</p>
                <?php endif; ?>
                
                <section class="instrucciones">
                    <h3>Para el observador:</h3>
                    <p> Complete los siguientes datos sobre la prueba realizada.</p>
                </section>
                
                <form method="POST" action="#">
                    <fieldset class="campo-formulario">
                        <label for="dispositivo">Dispositivo utilizado:</label>
                        <select id="dispositivo" name="dispositivo" required>
                            <option value="">Seleccione un dispositivo</option>
                            <option value="Ordenador">Ordenador</option>
                            <option value="Tableta">Tableta</option>
                            <option value="Teléfono">Teléfono</option>
                        </select>
                    </fieldset>
                    
                    <fieldset class="campo-formulario">
                        <label for="comentario">Comentario del participante (opcional):</label>
                        <textarea id="comentario" name="comentario" placeholder="Comentarios generales sobre la experiencia"></textarea>
                    </fieldset>
                    
                    <fieldset class="campo-formulario">
                        <label for="propuesta_mejora">Propuesta de mejora del participante (opcional):</label>
                        <textarea id="propuesta_mejora" name="propuesta_mejora" placeholder="Sugerencias de mejora"></textarea>
                    </fieldset>
                    
                    <fieldset class="campo-formulario">
                        <label for="valoracion">Valoración general (0-10):</label>
                        <input type="number" id="valoracion" name="valoracion" min="0" max="10" required>
                    </fieldset>
                    
                    <fieldset class="campo-formulario">
                        <label for="observacion_observador">Observaciones del evaluador (opcional):</label>
                        <textarea id="observacion_observador" name="observacion_observador" placeholder="Notas y observaciones durante la prueba"></textarea>
                    </fieldset>
                    
                    <p class="botones">
                        <button type="submit" name="guardar_observaciones" class="boton">Guardar y finalizar</button>
                    </p>
                </form>
                
            <?php elseif ($paso === 'finalizado'): ?>
                <h2>¡Prueba completada!</h2>
                
                <section class="confirmacion">
                    <h3>Gracias por su participación</h3>
                    <p>La prueba de usabilidad ha sido guardada correctamente en la base de datos.</p>
                    <p>Gracias por participar.</p>
                </section>
                
                <p class="botones">
                    <a href="formulario.php" class="boton" style="text-decoration: none; text-align: center; display: block;">Realizar nueva prueba</a>
                </p>
                
                <?php
                session_destroy();
                ?>
            <?php endif; ?>
        </section>
    </main>
</body>
</html>