[README.md](https://github.com/user-attachments/files/33683927/README.md)
# MotoGP Desktop

Proyecto académico desarrollado para la asignatura **Software y Estándares para la Web (SEW)** del Grado en Ingeniería Informática del Software de la **Universidad de Oviedo**.

**MotoGP Desktop** es una aplicación web temática sobre MotoGP que reúne información, contenidos multimedia y pequeñas funcionalidades interactivas. El proyecto combina desarrollo web con el uso de estándares para estructurar, validar, transformar y representar información.

## Funcionalidades

- Consulta de información sobre **pilotos, circuitos, meteorología y clasificaciones**.
- Navegación entre las distintas secciones de la aplicación, con un apartado de **ayuda**.
- Contenido multimedia y componentes interactivos, como un **carrusel de imágenes**.
- **Juegos**, entre ellos un juego de memoria con cartas y un cronómetro.
- Uso de datos estructurados y generación de recursos a partir de ellos mediante scripts de Python.

## Tecnologías utilizadas

| Área | Tecnologías |
| --- | --- |
| Estructura y presentación | HTML, CSS, SVG |
| Interactividad y lógica web | JavaScript, PHP |
| Datos y estándares | XML, XSD, DTD, KML |
| Transformación de datos | Python |
| Servidor y despliegue | Apache, Ubuntu, Microsoft Azure, SSH |

Los scripts de Python se emplean para transformar archivos y generar recursos, por ejemplo, representaciones SVG a partir de información XML siguiendo los esquemas definidos. **No son necesarios para servir todas las páginas**, salvo que se quiera volver a generar el contenido correspondiente.

## Obtención del proyecto

El despliegue es **manual**: no existe un proceso de instalación o despliegue automático mediante CI/CD.

1. Accede a este repositorio en GitHub.
2. Selecciona **Code → Download ZIP**.
3. Descarga el archivo ZIP y descomprímelo en tu equipo para examinar los archivos.
4. Para publicarlo en un servidor, transfiere los archivos al directorio servido por Apache, conservando las rutas relativas entre las páginas, los estilos, los scripts y los recursos multimedia.

> Las páginas que usan PHP requieren un servidor compatible con PHP; no basta con abrir los archivos directamente desde el explorador ni publicarlos únicamente en un alojamiento estático.

## Despliegue manual en Microsoft Azure

En el proyecto académico se utilizó una **máquina virtual Ubuntu en Azure**, con **Apache** como servidor web y acceso remoto mediante **SSH (MobaXterm)**. Los archivos se copiaron manualmente a la máquina virtual.

Los siguientes pasos muestran una **variante reproducible recomendada** de ese despliegue. Utiliza el directorio web habitual de Apache para facilitar la ejecución de las páginas PHP. Más abajo se explica la diferencia respecto a la ruta empleada en el despliegue académico original.

### 1. Crear y configurar la máquina virtual

1. En el portal de Azure, crea una **máquina virtual Ubuntu** (por ejemplo, Ubuntu Server 24.04 LTS).
2. Configura la región, el usuario administrador y la autenticación por **clave SSH**. Descarga y guarda de forma segura la clave privada.
3. En las reglas de red de entrada, permite **SSH (TCP 22)** desde tu dirección IP de administración y **HTTP (TCP 80)** para acceder a la aplicación.
4. Inicia la máquina y localiza su **dirección IP pública**.

> No subas la clave privada al repositorio ni abras SSH a toda Internet si puedes limitar el acceso.

### 2. Conectarse mediante SSH

Con MobaXterm, crea una sesión **SSH** e indica la IP pública de la máquina, el nombre de usuario de Ubuntu y la clave privada. También puedes conectarte desde una terminal:

```bash
ssh -i /ruta/a/clave_privada usuario@IP_PUBLICA
```

### 3. Instalar Apache y PHP

Dentro de la máquina virtual, ejecuta:

```bash
sudo apt update
sudo apt install apache2 php libapache2-mod-php unzip -y
sudo systemctl enable --now apache2
sudo systemctl status apache2
```

Estos comandos instalan Apache y la versión de PHP disponible en los repositorios de la distribución. Comprueba que Apache está activo antes de continuar.

### 4. Subir y descomprimir el proyecto

1. Descarga el **ZIP** del repositorio en tu ordenador.
2. Utiliza el explorador de archivos **SFTP de MobaXterm** (o cualquier cliente SFTP) para subirlo al directorio personal del usuario de la máquina virtual.
3. Desde la sesión SSH, descomprímelo:

```bash
cd ~
unzip NOMBRE_DEL_ARCHIVO.zip -d motogp-extraido
ls motogp-extraido
```

El directorio generado por GitHub suele contener una carpeta con el nombre del repositorio y la rama. Identifica dicha carpeta antes del siguiente paso.

### 5. Publicar los archivos con Apache

Crea el directorio web y copia **el contenido** de la carpeta del proyecto, no la carpeta contenedora del ZIP:

```bash
sudo mkdir -p /var/www/html/motogp
sudo cp -a motogp-extraido/NOMBRE_CARPETA_EXTRAIDA/. /var/www/html/motogp/
sudo chown -R root:root /var/www/html/motogp
sudo find /var/www/html/motogp -type d -exec chmod 755 {} \;
sudo find /var/www/html/motogp -type f -exec chmod 644 {} \;
sudo systemctl restart apache2
```

Sustituye `NOMBRE_DEL_ARCHIVO.zip` y `NOMBRE_CARPETA_EXTRAIDA` por los nombres reales. Mantén también los archivos PHP que formen parte de las funcionalidades del proyecto.

### 6. Acceder a la aplicación

En el navegador, accede a:

```text
http://IP_PUBLICA/motogp/
```

Si la página inicial no se llama `index.html` o `index.php`, añade a la URL el nombre real del archivo de entrada. Comprueba la navegación, la carga de CSS/JavaScript, los recursos multimedia y las páginas que utilizan PHP.

### Diferencia con el despliegue académico original

En la memoria de despliegue original, el sitio se publicó en **`~/public_html`**, habilitando el módulo **`userdir`** de Apache, y se accedía mediante una URL con este formato:

```text
http://IP_PUBLICA/~USUARIO/
```

Aquella instalación utilizó PHP 8.0 procedente de un repositorio adicional. En esta guía se propone usar la versión de PHP disponible en la distribución y un directorio bajo `/var/www/html` para evitar configuraciones adicionales de ejecución de PHP en los directorios personales. **Ambos procedimientos son manuales**.

## Pruebas de usabilidad

Se realizaron **tres tandas de pruebas exploratorias con siete participantes**, utilizando distintos dispositivos y perfiles de usuario. Las observaciones permitieron introducir mejoras, entre ellas:

- Corrección de la visualización de las imágenes del juego de memoria.
- Reformulación de preguntas para reducir ambigüedades.
- Aumento de la separación entre opciones del menú de navegación.

Estas pruebas se realizaron en el contexto de una práctica académica y **no constituyen un estudio estadísticamente representativo**.

## Contexto académico

Proyecto elaborado como parte de la asignatura **Software y Estándares para la Web**. Su objetivo es aplicar distintas tecnologías de desarrollo web, estándares de representación de datos y procedimientos de publicación y evaluación de una aplicación.
