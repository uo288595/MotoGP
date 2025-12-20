<?php
class Configuracion {
    private $host = "localhost";
    private $usuario = "DBUSER2025";
    private $contrasena = "DBPSWD2025";
    private $nombreBD = "UO288595_DB";

    private function conexionAdmin() {
        $cn = new mysqli($this->host, $this->usuario, $this->contrasena);
        if ($cn->connect_error) {
            die("Error conexión admin: " . $cn->connect_error);
        }
        return $cn;
    }

    private function conexionBD() {
        $cn = new mysqli(
            $this->host,
            $this->usuario,
            $this->contrasena,
            $this->nombreBD
        );
        return $cn;
    }
    
    public function reiniciarBaseDatos() {
        $cn = $this->conexionAdmin();
        $sql = file_get_contents('UO288595_DB.sql');
        $cn->multi_query($sql);
        $cn->close();
        return "Base de datos reiniciada correctamente.";
    }

    public function deleteBaseDatos() {
        $cn = $this->conexionAdmin();
        $cn->query("DROP DATABASE IF EXISTS " . $this->nombreBD);
        $cn->close();
        return "Base de datos eliminada correctamente.";
 }

    public function exportarBaseDatosCSV() {
        $cn = $this->conexionBD();

        if ($cn->connect_error) {
            return "Error de conexión a la base de datos: " . $cn->connect_error;
        } else {
            $tablas = $cn->query("SHOW TABLES");
            while ($fila = $tablas->fetch_array()) {
                $tabla = $fila[0];
                $resultado = $cn->query("SELECT * FROM $tabla");

                $archivoCSV = "{$tabla}.csv";
                $fp = fopen($archivoCSV, 'w');

                // Escribir BOM para UTF-8 (para que salga el texto correctamente en Excel)
                fprintf($fp, chr(0xEF).chr(0xBB).chr(0xBF));

                $campos = $resultado->fetch_fields();
                $nombresCampos = [];
                foreach ($campos as $campo) {
                    $nombresCampos[] = $campo->name;
                }
                fputcsv($fp, $nombresCampos, ";");

                while ($row = $resultado->fetch_assoc()) {
                    fputcsv($fp, $row, ";");
                }

                fclose($fp);
            }
            return "Base de datos exportada a CSV correctamente.";
        }
    }

    public function importarTablasDesdeCSV($archivoCSV) {
        $cn = $this->conexionBD();
        if ($cn->connect_error) {
            return "Error de conexión a la base de datos: " . $cn->connect_error;
        }

        $tmpName = $archivoCSV['tmp_name'];
        if (!is_uploaded_file($tmpName)) {
            return "Archivo CSV no válido o no subido correctamente.";
        }

        $handle = fopen($tmpName, 'r');
        if ($handle === false) {
            return "No se pudo abrir el archivo CSV.";
        }

        // Nombre de la tabla en mayúscula inicial
        $tabla = ucfirst(pathinfo($archivoCSV['name'], PATHINFO_FILENAME));

        // Leer los nombres de columnas del CSV
        $nombresCamposCSV = fgetcsv($handle, 0, ";");

        // Obtenemos info de la tabla para conocer tipos y columnas
        $infoTabla = $cn->query("SHOW COLUMNS FROM `$tabla`")->fetch_all(MYSQLI_ASSOC);

        $camposFinales = [];
        $tipos = '';

        // Ignoramos el primer campo (id auto_increment)
        foreach ($nombresCamposCSV as $i => $campo) {
            if ($i === 0) continue; 
            foreach ($infoTabla as $col) {
                if (strtolower($col['Field']) === strtolower($campo)) {
                    $camposFinales[] = $campo;

                    // Definimos tipo para bind_param
                    $type = 's'; // por defecto string
                    if (stripos($col['Type'], 'int') !== false) $type = 'i';
                    if (stripos($col['Type'], 'float') !== false || stripos($col['Type'], 'double') !== false) $type = 'd';
                    $tipos .= $type;
                    break;
                }
            }
        }

        $placeholders = implode(',', array_fill(0, count($camposFinales), '?'));
        $camposEscapados = array_map(fn($c) => "`$c`", $camposFinales);

        $stmt = $cn->prepare("INSERT INTO `$tabla` (" . implode(',', $camposEscapados) . ") VALUES ($placeholders)");
        if ($stmt === false) {
            error_log("Prepare failed: " . $cn->error);
            fclose($handle);
            return "Error preparando el INSERT en la tabla $tabla.";
        }

        // Leer filas y ejecutar
        while (($data = fgetcsv($handle, 0, ";")) !== false) {
            $datosFinales = array_slice($data, 1); // quitamos la primera columna (id)
            // Convertir tipos numéricos si es necesario
            foreach ($datosFinales as $k => $v) {
                if ($tipos[$k] === 'i') $datosFinales[$k] = (int)$v;
                if ($tipos[$k] === 'd') $datosFinales[$k] = (float)$v;
            }
            $stmt->bind_param($tipos, ...$datosFinales);
            $stmt->execute();
        }

        fclose($handle);
        return "Datos importados correctamente en la tabla $tabla.";
    }

    public function cargarPreguntas() {
        $cn = $this->conexionBD();

        if ($cn->connect_error) {
            return "Error de conexión a la base de datos: " . $cn->connect_error;
        } else {
            $sql = file_get_contents('insert_preguntas_UO288595.sql');
            $cn->multi_query($sql);
            $cn->close();
            return "Preguntas cargadas correctamente correctamente.";
        }
    }

    public function insertUsuario($profesion, $edad, $genero, $pericia) {
        $cn = $this->conexionBD();

        if ($cn->connect_error) {
            return "Error de conexión a la base de datos: " . $cn->connect_error;
        } else {
            $stmt = $cn->prepare(
                "INSERT INTO Usuario (profesion, edad, genero, pericia)
                VALUES (?, ?, ?, ?)"
            );

            if ($stmt === false) {
                error_log("Prepare failed: " . $cn->error);
                return "Error preparando el INSERT.";
            }

            $stmt->bind_param("sisi", $profesion, $edad, $genero, $pericia);

            $stmt->execute();
            return "Usuario insertado correctamente.";
        }
    }

}
?>