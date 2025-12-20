import xml.etree.ElementTree as ET

class Svg(object):
    """
    Genera archivos SVG con rectángulos, círculos, líneas, polilíneas y texto
    @version 1.0 18/Octubre/2024
    @author: Juan Manuel Cueva Lovelle. Universidad de Oviedo
    """
    def __init__(self):
        """
        Crea el elemento raíz, el espacio de nombres y la versión
        """
        self.raiz = ET.Element('svg', xmlns="http://www.w3.org/2000/svg", version="1.1")

    
    def addRect(self,x,y,width,height,fill, stroke_width,stroke):
        """
        Añade un elemento rect (usa atributos SVG correctos)
        """
        ET.SubElement(self.raiz,'rect',{
                      'x':str(x),
                      'y':str(y),
                      'width':str(width),
                      'height':str(height),
                      'fill':fill, 
                      'stroke-width':str(stroke_width),
                      'stroke':stroke})
        
    def addCircle(self,cx,cy,r,fill):
        """
        Añade un elemento circle
        """
        ET.SubElement(self.raiz,'circle',{
                      'cx':str(cx),
                      'cy':str(cy),
                      'r':str(r),
                      'fill':fill})
        
    def addLine(self,x1,y1,x2,y2,stroke,stroke_width):
        """
        Añade un elemento line (atributo stroke-width)
        """
        ET.SubElement(self.raiz,'line',{
                      'x1':str(x1),
                      'y1':str(y1),
                      'x2':str(x2),
                      'y2':str(y2),
                      'stroke':stroke,
                      'stroke-width':str(stroke_width)})

    def addPolyline(self,points,stroke,stroke_width,fill):
        """
        Añade un elemento polyline
        """
        ET.SubElement(self.raiz,'polyline',{
                      'points':points,
                      'stroke':stroke,
                      'stroke-width':str(stroke_width),
                      'fill':fill})
        
    def addText(self,texto,x,y,fontFamily,fontSize,style):
        """
        Añade un elemento texto (atributos con guion)
        """
        ET.SubElement(self.raiz,'text',{
                      'x':str(x),
                      'y':str(y),
                      'font-family':fontFamily,
                      'font-size':str(fontSize),
                      'style':style}).text=texto

    def escribir(self,nombreArchivoSVG):
        """ de
        Escribe el archivo SVG con declaración y codificación
        """
        arbol = ET.ElementTree(self.raiz)
        
        """
        Introduce indentacióon y saltos de línea
        para generar XML en modo texto
        """
        ET.indent(arbol)
        
        arbol.write(nombreArchivoSVG, 
                    encoding='utf-8', 
                    xml_declaration=True
                    )
    
    def ver(self):
        """
        Muestra el archivo SVG. Se utiliza para depurar
        """
        print("\nElemento raiz = ", self.raiz.tag)

        if self.raiz.text != None:
            print("Contenido = "    , self.raiz.text.strip('\n')) #strip() elimina los '\n' del string
        else:
            print("Contenido = "    , self.raiz.text)
        
        print("Atributos = "    , self.raiz.attrib)

        # Recorrido de los elementos del árbol
        for hijo in self.raiz.findall('.//'): # Expresión XPath
            print("\nElemento = " , hijo.tag)
            if hijo.text != None:
                print("Contenido = ", hijo.text.strip('\n')) #strip() elimina los '\n' del string
            else:
                print("Contenido = ", hijo.text)    
            print("Atributos = ", hijo.attrib)


NS = {"uni": "http://www.uniovi.es"}

def obtener_altimetria(xml_file):
    """Obtiene distancias acumuladas y altitudes del circuito"""
    tree = ET.parse(xml_file)
    root = tree.getroot()

    dist_acumulada = 0
    distancias = []
    altitudes = []

    # Origen
    origen = root.find("uni:origenCircuito/uni:coordenada", NS)
    if origen is not None:
        alt = float(origen.find("uni:altitud", NS).text)
        altitudes.append(alt)
        distancias.append(dist_acumulada)

    # Puntos del tramo
    for punto in root.findall("uni:puntoTramo", NS):
        distancia = float(punto.find("uni:distanciaTramo", NS).text)
        alt = float(punto.find("uni:coordenada/uni:altitud", NS).text)
        dist_acumulada += distancia
        distancias.append(dist_acumulada)
        altitudes.append(alt)

    return distancias, altitudes

def escalar_svg(distancias, altitudes, ancho=800, alto=400, margen=50):
    # Transforma los datos a coordenadas en píxeles para SVG
    # proteger contra listas vacías
    if not distancias:
        return []
    x_max = max(distancias)
    if x_max == 0:
        x_max = 1.0  # evitar división por cero si todas las distancias son 0

    y_min = min(altitudes)
    y_max = max(altitudes)
    
    # Evitar división por cero si todas las altitudes son iguales
    y_range = y_max - y_min
    if y_range == 0:
        y_range = 1  # Se asigna 1 para que no divida por cero

    puntos = []
    for d, a in zip(distancias, altitudes):
        x = margen + (d / x_max) * (ancho - 2*margen)
        y = alto - margen - ((a - y_min) / y_range) * (alto - 2*margen)
        puntos.append((x, y))
    return puntos

def alt_to_y(alt, alto, margen, y_min, y_max):
    """Convierte una altitud a coordenada y en píxeles (sin tocar x)"""
    y_range = y_max - y_min
    if y_range == 0:
        y_range = 1.0
    return alto - margen - ((alt - y_min) / y_range) * (alto - 2*margen)

def crear_altimetria_svg(xml_file, svg_file):
    distancias, altitudes = obtener_altimetria(xml_file)
    if not distancias:
        raise ValueError("No se han encontrado distancias en el XML.")
    ancho, alto = 800, 400
    margen = 50
    puntos = escalar_svg(distancias, altitudes, ancho, alto, margen)

    svg = Svg()
    
    # Crear polilínea con relleno para efecto de suelo
    puntos_str = " ".join(f"{x},{y}" for x, y in puntos)
    # Añadimos el suelo cerrando la polilínea al final y bajando hasta el borde inferior (margen)
    x0, y0 = puntos[0]
    xn, yn = puntos[-1]
    # añadimos: último hacia el suelo, primer punto en suelo, y volvemos al primer punto original
    puntos_str += f" {xn},{alto-margen} {x0},{alto-margen} {x0},{y0}"
    svg.addPolyline(puntos_str, stroke="darkblue", stroke_width=2, fill="lightblue")
    
    # Opcional: líneas de escala horizontal cada 20 altitudes
    y_min, y_max = min(altitudes), max(altitudes)
    for alt in range(int(y_min), int(y_max)+1, 20):
        y = alt_to_y(alt, alto, margen, y_min, y_max)
        # dibujar la línea dentro del área gráfica (desde margen hasta ancho-margen)
        svg.addLine(margen, y, ancho-margen, y, stroke="gray", stroke_width=0.5)
        svg.addText(str(alt), 5, y-2, "Verdana", 10, "none")
    
    # Escribir archivo
    svg.raiz.set('viewBox', f'0 0 {ancho} {alto}')
    svg.escribir(svg_file)
    print(f"Archivo SVG generado: {svg_file}")

def main():
    xml_file = "circuitoEsquema.xml"
    svg_file = "altimetria.svg"
    crear_altimetria_svg(xml_file, svg_file)

if __name__ == "__main__":
    main()
