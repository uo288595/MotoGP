<?php

class GestionPrueba {
    
    public function iniciarPrueba($profesion, $edad, $genero, $pericia) {
        // Validar datos
        if (empty($profesion) || empty($edad) || empty($genero) || empty($pericia)) {
            return "Error: Todos los campos son obligatorios.";
        }
        
        if (!is_numeric($edad) || $edad < 0) {
            return "Error: La edad debe ser un número positivo.";
        }
        
        if (!in_array($genero, ['Masculino', 'Femenino', 'Otro'])) {
            return "Error: Género no válido.";
        }
        
        if (!is_numeric($pericia) || $pericia < 0 || $pericia > 10) {
            return "Error: La pericia debe ser un número entre 0 y 10.";
        }
        
        
        $cn = new mysqli("localhost", "DBUSER2025", "DBPSWD2025", "UO288595_DB");
        
        if ($cn->connect_error) {
            return "Error de conexión a la base de datos: " . $cn->connect_error;
        }
        
        $stmt = $cn->prepare(
            "INSERT INTO Usuario (profesion, edad, genero, pericia)
            VALUES (?, ?, ?, ?)"
        );
        
        if ($stmt === false) {
            $cn->close();
            return "Error preparando el INSERT: " . $cn->error;
        }
        
        $stmt->bind_param("sisi", $profesion, $edad, $genero, $pericia);
        
        if ($stmt->execute()) {
            // Devuelve el ID del usuario insertado
            $id_usuario = $stmt->insert_id;
            $stmt->close();
            $cn->close();
            return $id_usuario; 
        } else {
            // Devuelve el error en caso de fallo
            $error = $stmt->error;
            $stmt->close();
            $cn->close();
            return "Error al insertar usuario: " . $error;
        }
    }

    public function obtenerPreguntas() {
        $cn = new mysqli("localhost", "DBUSER2025", "DBPSWD2025", "UO288595_DB");
        
        if ($cn->connect_error) {
            return [];
        }
        
        $resultado = $cn->query("SELECT * FROM Pregunta ORDER BY id_pregunta");
        
        $preguntas = [];
        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $preguntas[] = $fila;
            }
        }
        
        $cn->close();
        return $preguntas;
    }
    
    public function guardarResultado($id_usuario, $dispositivo, $tiempo, $completado, $comentario, $propuesta_mejora, $valoracion) {
        $cn = new mysqli("localhost", "DBUSER2025", "DBPSWD2025", "UO288595_DB");
        
        if ($cn->connect_error) {
            return "Error de conexión: " . $cn->connect_error;
        }
        
        
        $completado_int = $completado ? 1 : 0;
        
        // Si los campos opcionales están vacíos, guardar NULL en lugar de string vacío
        $comentario_final = empty($comentario) ? NULL : $comentario;
        $propuesta_final = empty($propuesta_mejora) ? NULL : $propuesta_mejora;
        
        $stmt = $cn->prepare(
            "INSERT INTO Resultado (id_usuario, dispositivo, tiempo, completado, comentario, propuesta_mejora, valoracion)
            VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        
        if ($stmt === false) {
            $cn->close();
            return "Error preparando el INSERT: " . $cn->error;
        }
        
        $stmt->bind_param("isdissi", $id_usuario, $dispositivo, $tiempo, $completado_int, $comentario_final, $propuesta_final, $valoracion);
        
        if ($stmt->execute()) {
            $stmt->close();
            $cn->close();
            return "Resultado guardado correctamente.";
        } else {
            $error = $stmt->error;
            $stmt->close();
            $cn->close();
            return "Error al guardar resultado: " . $error;
        }
    }
    
    public function guardarObservacion($id_usuario, $comentario) {
        $cn = new mysqli("localhost", "DBUSER2025", "DBPSWD2025", "UO288595_DB");
        
        if ($cn->connect_error) {
            return "Error de conexión: " . $cn->connect_error;
        }
        
        $stmt = $cn->prepare(
            "INSERT INTO Observacion (id_usuario, comentario)
            VALUES (?, ?)"
        );
        
        if ($stmt === false) {
            return "Error preparando el INSERT: " . $cn->error;
        }
        
        $stmt->bind_param("is", $id_usuario, $comentario);
        
        if ($stmt->execute()) {
            $stmt->close();
            $cn->close();
            return "Observación guardada correctamente.";
        } else {
            $error = $stmt->error;
            $stmt->close();
            $cn->close();
            return "Error al guardar observación: " . $error;
        }
    }
    
    public function guardarRespuesta($id_usuario, $id_pregunta, $respuesta) {
        $cn = new mysqli("localhost", "DBUSER2025", "DBPSWD2025", "UO288595_DB");
        
        if ($cn->connect_error) {
            return "Error de conexión: " . $cn->connect_error;
        }
        
        $stmt = $cn->prepare(
            "INSERT INTO Respuesta (id_usuario, id_pregunta, respuesta)
            VALUES (?, ?, ?)"
        );
        
        if ($stmt === false) {
            return "Error preparando el INSERT: " . $cn->error;
        }

        $stmt->bind_param("iis", $id_usuario, $id_pregunta, $respuesta);

        if ($stmt->execute()) {
            $stmt->close();
            $cn->close();
            return "Respuesta guardada correctamente.";
        } else {
            $error = $stmt->error;
            $stmt->close();
            $cn->close();
            return "Error al guardar respuesta: " . $error;
        }
    }
}
?>