import os
import re

md_path = r"Docs\Reporte_Final_Residencias_Profesionales_TESChi_Irvin_Galvez.md"

with open(md_path, "r", encoding="utf-8") as f:
    text = f.read()

replacements = [
    # Chapter I
    (
        "El objetivo central de este trabajo de titulación es resolver de forma definitiva y sustentable la fragilidad operativa",
        "El objetivo central de este trabajo de titulación (TecNM, 2015; TESChi, 2015) es resolver de forma definitiva y sustentable la fragilidad operativa"
    ),
    (
        "desarrollo de una Aplicación Web Progresiva (siglas en inglés PWA, Progressive Web App)",
        "desarrollo de una Aplicación Web Progresiva (siglas en inglés PWA, Progressive Web App; Berriman & Russell, 2015; Russell, 2016)"
    ),
    (
        "resiliencia ante fallos mediante arquitecturas residuales.",
        "resiliencia ante fallos mediante arquitecturas residuales (O'Reilly, 2020, 2022)."
    ),
    (
        "número identificador en negritas, título descriptivo en cursivas, contenido estructurado con bordes limpios y notas al pie explicativas que detallan las fuentes, licencias y especificaciones técnicas.",
        "número identificador en negritas, título descriptivo en cursivas, contenido estructurado con bordes limpios y notas al pie explicativas que detallan las fuentes, licencias y especificaciones técnicas (American Psychological Association [APA], 2020)."
    ),

    # Chapter II
    (
        "política de calidad institucional orientada a la satisfacción de la comunidad estudiantil y a la mejora continua",
        "política de calidad institucional orientada a la satisfacción de la comunidad estudiantil y a la mejora continua (TESChi, 2024; Rodríguez Valencia, 1992)"
    ),
    (
        "coordinado académicamente por el Tecnológico Nacional de México (TecNM).",
        "coordinado académicamente por el Tecnológico Nacional de México (TecNM, 2015; TESChi, 2024)."
    ),

    # Chapter III
    (
        "arquitectura web tradicional basada en llamadas síncronas cliente-servidor",
        "arquitectura web tradicional basada en llamadas síncronas cliente-servidor (Fielding, 2000; Biørn-Hansen et al., 2019)"
    ),
    (
        "caídas intermitentes de cobertura móvil en el campus",
        "caídas intermitentes de cobertura móvil en el campus (Allsopp, 2016; Keith, 2016)"
    ),

    # Chapter IV - Pregunta 1
    (
        "se trata de una mejora progresiva (*Progressive Enhancement*) construida sobre estándares abiertos del World Wide Web Consortium (W3C).",
        "se trata de una mejora progresiva (*Progressive Enhancement*) construida sobre estándares abiertos del World Wide Web Consortium (W3C, 2020; Berriman & Russell, 2015)."
    ),
    (
        "excluyendo a usuarios con terminales modestos.",
        "excluyendo a usuarios con terminales modestos (Biørn-Hansen et al., 2019; Osmani, 2020)."
    ),
    (
        "La directiva oculta por completo los controles y barras de navegación del explorador, otorgando una experiencia visual, táctil y de ventana indistinguible de un software nativo compilado.",
        "La directiva oculta por completo los controles y barras de navegación del explorador, otorgando una experiencia visual, táctil y de ventana indistinguible de un software nativo compilado (W3C, 2020; Russell, 2016)."
    ),

    # Chapter IV - Pregunta 2
    (
        "Este paradigma desafía el axioma clásico sobre el cual se construyó la web durante sus primeras dos décadas",
        "Este paradigma (Feyerke, 2013; Allsopp, 2016; Lawson, 2015) desafía el axioma clásico sobre el cual se construyó la web durante sus primeras dos décadas"
    ),
    (
        "reflexiones de señal.",
        "reflexiones de señal (Allsopp, 2016; Keith, 2016)."
    ),
    (
        "Timestamp Order / Last-Write-Wins",
        "Timestamp Order / Last-Write-Wins (Lawson, 2015; Feyerke, 2013)"
    ),

    # Chapter IV - Pregunta 3
    (
        "completamente desacoplado del hilo principal de ejecución de la interfaz gráfica (DOM).",
        "completamente desacoplado del hilo principal de ejecución de la interfaz gráfica (DOM; W3C, 2019; Google Workbox Team, 2022)."
    ),
    (
        "operar como un servidor proxy programable del lado del cliente",
        "operar como un servidor proxy programable del lado del cliente (Keith, 2016; Osmani, 2020; Zakas, 2016)"
    ),

    # Chapter IV - Pregunta 4
    (
        "motor de base de datos NoSQL transaccional, asíncrono y orientado a objetos integrado en los navegadores modernos",
        "motor de base de datos NoSQL transaccional, asíncrono y orientado a objetos integrado en los navegadores modernos (W3C, 2024; MDN Web Docs, 2023)"
    ),
    (
        "limita severamente su capacidad a solo 5 MB y bloquea el hilo de renderizado principal",
        "limita severamente su capacidad a solo 5 MB y bloquea el hilo de renderizado principal (Zakas, 2016; MDN Web Docs, 2023)"
    ),

    # Chapter IV - Pregunta 5
    (
        "metodología de construcción de interfaces de usuario que invierte el proceso de desarrollo tradicional",
        "metodología de construcción de interfaces de usuario que invierte el proceso de desarrollo tradicional (Coleman et al., 2017; Frost, 2016)"
    ),
    (
        "componentes contenedores (Container Components) y componentes puramente visuales (Presentational Components)",
        "componentes contenedores (*Container Components*) y componentes puramente visuales (*Presentational Components*; Abramov, 2015; Frost, 2016)"
    ),

    # Chapter IV - Pregunta 6
    (
        "desacoplar el núcleo de lógica de negocio y dominio de las tecnologías externas de infraestructura",
        "desacoplar el núcleo de lógica de negocio y dominio de las tecnologías externas de infraestructura (Cockburn, 2005; Martin, 2017; Evans, 2003)"
    ),

    # Chapter IV - Pregunta 7
    (
        "La Teoría de Residualidad (Residuality Theory) fue formulada por el científico de la computación y arquitecto de software Barry O'Reilly",
        "La Teoría de Residualidad (*Residuality Theory*) fue formulada por el científico de la computación y arquitecto de software Barry O'Reilly (2020, 2022)"
    ),
    (
        "La resiliencia de un sistema no se mide por la satisfacción estática de una lista de requerimientos, sino por el residuo funcional que sobrevive al impacto de estresores imprevistos.",
        "La resiliencia de un sistema no se mide por la satisfacción estática de una lista de requerimientos, sino por el residuo funcional que sobrevive al impacto de estresores imprevistos (O'Reilly, 2020, 2022)."
    ),

    # Chapter IV - Pregunta 8
    (
        "norma internacional ISO/IEC 25010 (Systems and software Quality Requirements and Evaluation - SQuaRE)",
        "norma internacional ISO/IEC 25010 (*Systems and software Quality Requirements and Evaluation - SQuaRE*; ISO/IEC, 2011; Google Developers, 2020)"
    ),
    (
        "Largest Contentful Paint (LCP), Interaction to Next Paint (INP) y Cumulative Layout Shift (CLS)",
        "Largest Contentful Paint (LCP), Interaction to Next Paint (INP) y Cumulative Layout Shift (CLS; Google Developers, 2020)"
    ),

    # Chapter IV - Pregunta 9
    (
        "requisitos para el establecimiento, implementación, mantenimiento y mejora continua de un Sistema de Gestión de la Seguridad de la Información (SGSI)",
        "requisitos para el establecimiento, implementación, mantenimiento y mejora continua de un Sistema de Gestión de la Seguridad de la Información (SGSI; ISO/IEC, 2022)"
    ),
    (
        "algoritmo criptográfico SHA-256",
        "algoritmo criptográfico SHA-256 (ISO/IEC, 2022; Zakas, 2016)"
    ),

    # Chapter IV - Pregunta 10
    (
        "siete principios de diálogo ergonómico que deben regir la interacción entre personas y sistemas interactivos",
        "siete principios de diálogo ergonómico que deben regir la interacción entre personas y sistemas interactivos (ISO, 2020; Nielsen & Molich, 1990)"
    ),
    (
        "Pautas de Accesibilidad para el Contenido Web (WCAG 2.1)",
        "Pautas de Accesibilidad para el Contenido Web (WCAG 2.1; W3C, 2018; ISO/IEC, 2012; Chisholm et al., 2001)"
    ),

    # Chapter V - Kárdex and Login Updates
    (
        "Descarga de Kárdex Oficial en PDF",
        "Consulta Dinámica de Kárdex en Pantalla (Modo Solo Lectura)"
    ),
    (
        "Exportar Historial Académico en formato PDF con diseño institucional y sello digital",
        "Visualización interactiva y segura de calificaciones y avance curricular en tiempo real (exclusiva en pantalla sin descarga local; ISO/IEC, 2022)"
    )
]

applied_count = 0
for old, new in replacements:
    if old in text:
        text = text.replace(old, new)
        applied_count += 1
    else:
        print(f"NOT FOUND: {old[:50]}...")

print(f"Applied {applied_count} of {len(replacements)} citation updates.")

with open(md_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Saved enriched markdown file!")
