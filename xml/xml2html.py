import xml.etree.ElementTree as ET

NS = {"uni": "http://www.uniovi.es"}

class Html:
    """
    Genera archivos HTML con encabezado, cuerpo y enlaces a CSS
    """
    def __init__(self, titulo="Información del Circuito"):
        self.titulo = titulo
        self.head_elements = []
        self.body_elements = []

    def add_head(self, elemento):
        self.head_elements.append(elemento)

    def add_body(self, elemento):
        self.body_elements.append(elemento)

    def escribir(self, nombreArchivoHTML):
        # Construir documento
        html_root = ET.Element("html", lang="es")
        head = ET.SubElement(html_root, "head")
        ET.SubElement(head, "meta", charset="UTF-8")
        ET.SubElement(head, "meta", name="viewport", content="width=device-width, initial-scale=1.0")
        title = ET.SubElement(head, "title")
        title.text = self.titulo
        ET.SubElement(head, "link", rel="stylesheet", href="../estilo/estilo.css")

        for elem in self.head_elements:
            head.append(elem)

        body = ET.SubElement(html_root, "body")
        h1 = ET.SubElement(body, "h1")
        h1.text = self.titulo

        for elem in self.body_elements:
            body.append(elem)

        # Serializar como HTML y escribir con DOCTYPE (valido para el validador)
        ET.indent(html_root, space="  ", level=0)
        html_str = ET.tostring(html_root, encoding="utf-8", method="html")
        with open(nombreArchivoHTML, "wb") as f:
            f.write(b"<!DOCTYPE html>\n")
            f.write(html_str)


def generar_info_html(xml_file, html_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()

    html = Html("Información del Circuito")

    # Main (usar tags semánticos en lugar de divs)
    main = ET.Element("main")

    # Datos principales como lista de definiciones (dl)
    dl = ET.SubElement(main, "dl")

    etiquetas = ["nombre", "longitudCircuito", "anchura", "fecha", "horaEsp",
                 "numeroVueltas", "localidadProxima", "pais", "patrocinador",
                 "vencedorYTiempo"]

    for tag in etiquetas:
        elem_xml = root.find(f"uni:{tag}", NS)
        if elem_xml is not None and elem_xml.text is not None:
            dt = ET.SubElement(dl, "dt")
            dt.text = tag
            dd = ET.SubElement(dl, "dd")
            dd.text = elem_xml.text

    # Referencias bibliográficas -> section con lista
    refs = root.findall("uni:referenciaBibliografia/uni:referencia", NS)
    if refs:
        section_refs = ET.SubElement(main, "section")
        h2 = ET.SubElement(section_refs, "h2")
        h2.text = "Referencias"
        ul = ET.SubElement(section_refs, "ul")
        for r in refs:
            li = ET.SubElement(ul, "li")
            a = ET.SubElement(li, "a", href=r.text or "", target="_blank")
            a.text = r.text or ""

    # Galería de fotos -> figure por foto
    fotos = root.findall("uni:galeriaFotografia/uni:fotografia", NS)
    if fotos:
        section_fotos = ET.SubElement(main, "section")
        h2 = ET.SubElement(section_fotos, "h2")
        h2.text = "Galería de fotos"
        for fpath in fotos:
            figure = ET.SubElement(section_fotos, "figure")
            img = ET.SubElement(figure, "img", src=fpath.text or "", alt="Foto del circuito")
            figcap = ET.SubElement(figure, "figcaption")
            figcap.text = "Foto del circuito"

    # Galería de videos -> section con video + source. controls="controls" y fallback como tail
    videos = root.findall("uni:galeriaVideos/uni:video", NS)
    if videos:
        section_videos = ET.SubElement(main, "section")
        h2 = ET.SubElement(section_videos, "h2")
        h2.text = "Galería de videos"
        for vpath in videos:
            vid = ET.SubElement(section_videos, "video", controls="controls")
            src = ET.SubElement(vid, "source", src=vpath.text or "", type="video/mp4")
            # fallback text debe ir después de los <source>, usar tail del último <source>
            src.tail = "Tu navegador no soporta video."

    # Clasificados (si existen) -> lista
    clasificados = root.findall("uni:clasificados/*", NS)
    if clasificados:
        section_clas = ET.SubElement(main, "section")
        h2 = ET.SubElement(section_clas, "h2")
        h2.text = "Clasificados"
        ol = ET.SubElement(section_clas, "ol")
        for c in clasificados:
            li = ET.SubElement(ol, "li")
            li.text = c.text or ""

    html.add_body(main)
    html.escribir(html_file)
    print(f"Archivo HTML generado: {html_file}")


def main():
    xml_file = "circuitoEsquema.xml"
    html_file = "InfoCircuito.html"
    generar_info_html(xml_file, html_file)

if __name__ == "__main__":
    main()
