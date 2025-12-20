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