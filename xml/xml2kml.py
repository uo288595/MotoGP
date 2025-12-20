import xml.etree.ElementTree as ET

# Archivo xml a leer
archivo_xml = "circuitoEsquema.xml"
# Nombre del archivo kml a generar
archivo_kml = "circuito.kml"
# Namespace de circuitoEsquema.xml
NS = {"uni": "http://www.uniovi.es"}

def obtener_tramos(xml_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()
    coords = []

    # Origen
    origen = root.find("uni:origenCircuito/uni:coordenada", NS)
    if origen is not None:
        origen_coord = {
            'longitud': origen.find("uni:longitud", NS).text,
            'latitud': origen.find("uni:latitud", NS).text,
            'altitud': origen.find("uni:altitud", NS).text
        }
        coords.append(origen_coord)

    # Puntos del tramo
    for punto in root.findall("uni:puntoTramo/uni:coordenada", NS):
        coords.append({
            'longitud': punto.find("uni:longitud", NS).text,
            'latitud': punto.find("uni:latitud", NS).text,
            'altitud': punto.find("uni:altitud", NS).text
        })

    # Añadir de nuevo el origen al final para cerrar la polilínea
    if origen is not None:
        coords.append(origen_coord)

    return coords 


def crear_kml(coordenadas, nombre_archivo):
    
    with open(nombre_archivo, 'w', encoding='utf-8') as archivo:
        
        # Prólogo: Encabezado del archivo KML
        archivo.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        archivo.write('<kml xmlns="http://www.opengis.net/kml/2.2">\n')
        archivo.write('<Document>\n')

        # Definir el estilo de la línea
        archivo.write('<Style id="polilinea">\n')
        archivo.write('  <LineStyle>\n')
        archivo.write('    <color>FF000080</color>\n')  
        archivo.write('    <width>4</width>\n')  # Grosor de la línea
        archivo.write('  </LineStyle>\n')
        archivo.write('</Style>\n')

        # Placemark con la polilínea
        archivo.write('<Placemark>\n')
        archivo.write('<styleUrl>#polilinea</styleUrl>\n')  # Referenciar el estilo
        archivo.write('<LineString>\n')
        archivo.write('<extrude>1</extrude>\n')
        archivo.write('<tessellate>1</tessellate>\n')
        archivo.write('<coordinates>\n')

        # Coordenadas
        for coord in coordenadas:
            archivo.write(f"{coord['longitud']},{coord['latitud']},{coord['altitud']}\n")

        # Epílogo: cierre de etiquetas
        archivo.write('</coordinates>\n')
        archivo.write('</LineString>\n')
        archivo.write('</Placemark>\n')
        archivo.write('</Document>\n')
        archivo.write('</kml>\n')

        print("Escritura del archivo KML completada.")

def main():
    coords = obtener_tramos(archivo_xml)
    crear_kml(coords, archivo_kml)

if __name__ == "__main__":
    main()
