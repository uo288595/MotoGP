CREATE DATABASE IF NOT EXISTS UO288595_DB;
USE UO288595_DB;

DROP TABLE IF EXISTS Respuesta;
DROP TABLE IF EXISTS Pregunta;
DROP TABLE IF EXISTS Observacion;
DROP TABLE IF EXISTS Resultado;
DROP TABLE IF EXISTS Usuario;

CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    profesion VARCHAR(50) NOT NULL,
    edad INT NOT NULL CHECK (edad >= 0),
    genero VARCHAR(20) NOT NULL CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
    pericia INT NOT NULL CHECK (pericia BETWEEN 0 AND 10)
);

CREATE TABLE Resultado (
    id_resultado INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    dispositivo VARCHAR(50) NOT NULL CHECK (dispositivo IN ('Ordenador', 'Tableta', 'Teléfono')),
    tiempo FLOAT NOT NULL,
    completado BOOLEAN NOT NULL,
    comentario VARCHAR(255),
    propuesta_mejora VARCHAR(255),
    valoracion INT NOT NULL CHECK (valoracion BETWEEN 0 AND 10),
    CONSTRAINT fk_resultado_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE Observacion (
    id_observacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    comentario VARCHAR(255),
    CONSTRAINT fk_observacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE Pregunta (
    id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
    texto VARCHAR(255) NOT NULL
);

CREATE TABLE Respuesta (
    id_respuesta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_pregunta INT NOT NULL,
    respuesta VARCHAR(255) NOT NULL,
    CONSTRAINT fk_respuesta_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_respuesta_pregunta
        FOREIGN KEY (id_pregunta)
        REFERENCES Pregunta(id_pregunta)
        ON DELETE CASCADE
);

