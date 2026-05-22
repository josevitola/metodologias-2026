# Reporte de Datos

Este documento presenta los resultados del análisis exploratorio inicial del dataset utilizado en el proyecto de reconocimiento facial, así como los resultados del preprocesamiento y la partición del dataset. El análisis se enfoca en la composición general de la base de imágenes, sus formatos, tamaño total, distribución por participante, calidad de los datos, transformaciones aplicadas y estructura final del conjunto de datos listo para modelamiento.

## Resumen general de los datos

El conjunto de datos está compuesto por _331 imágenes_ correspondientes a tres participantes o clases de reconocimiento facial: _jose, \*\*juan_ y _nicolas_.

Las imágenes se encuentran almacenadas en diferentes formatos:

- _.jpg:_ 163 imágenes
- _.png:_ 78 imágenes
- _.heic:_ 48 imágenes
- _.jpeg:_ 42 imágenes

El tamaño total del dataset es de _842.84 MB_, lo que refleja que se trabaja con archivos de imagen de distintas resoluciones y formatos.

La distribución de imágenes por participante es la siguiente:

- ⁠*jose:* 133 imágenes
- ⁠*juan:* 93 imágenes
- ⁠*nicolas:* 105 imágenes

En este caso, las observaciones corresponden a archivos de imagen, mientras que la variable categórica principal asociada a cada registro es la identidad del participante.

## Variable objetivo

La variable objetivo del proyecto es la _identidad del participante_ asociado a cada imagen. Esta variable será utilizada posteriormente para entrenar un modelo de clasificación que permita reconocer a qué persona corresponde un rostro.

Los valores posibles de la variable objetivo son:

- jose ⁠
- juan ⁠
- nicolas ⁠

## Variables individuales

### Total de imágenes

- ⁠*Descripción:* Número total de archivos de imagen contenidos en el dataset.
- ⁠*Valor observado:* 331 imágenes.
- ⁠*Interpretación:* Este indicador permite conocer el tamaño general de la base de datos disponible para el desarrollo del proyecto.

### Formato de archivo

- ⁠*Descripción:* Extensión de las imágenes presentes en el dataset.
- ⁠*Valores identificados:* ⁠ .heic ⁠, ⁠ .jpeg ⁠, ⁠ .png ⁠, ⁠ .jpg ⁠.
- ⁠*Interpretación:* La presencia de varios formatos hace necesario considerar procesos de estandarización en etapas posteriores, especialmente para asegurar compatibilidad durante la lectura y transformación de imágenes.

### Cantidad de imágenes por formato

| Formato | Cantidad |
| ------- | -------: |
| .heic   |       48 |
| .jpeg   |       42 |
| .png    |       78 |
| .jpg    |      163 |

- ⁠*Interpretación:* El formato más frecuente es ⁠ .jpg ⁠, mientras que ⁠ .jpeg ⁠ es el menos representado. Esta diversidad puede requerir conversión o normalización antes del entrenamiento del modelo.

Se observa que la clase con mayor representación es _jose, mientras que \*\*juan_ presenta la menor cantidad de imágenes. Aunque la distribución no es completamente uniforme, las tres clases cuentan con un volumen de imágenes suficiente para iniciar el proceso de modelado y posteriores etapas de balanceo o aumento de datos, si se considera necesario.

### Tamaño total del dataset

- ⁠*Descripción:* Peso acumulado de todos los archivos de imagen.
- ⁠*Valor observado:* 842.84 MB.
- ⁠*Interpretación:* El tamaño del dataset evidencia que se trabaja con imágenes en formatos y resoluciones variables, aspecto que puede influir en el tiempo de carga y procesamiento.

### Cantidad de imágenes por participante

| Participante | Cantidad de imágenes |
| ------------ | -------------------: |
| jose         |                  133 |
| juan         |                   93 |
| nicolas      |                  105 |

- ⁠*Interpretación:* Esta variable permite revisar la distribución de clases. Aunque no existe un desbalance extremo, sí hay diferencias en la representación de cada participante, por lo que conviene monitorear este aspecto en la etapa de entrenamiento.

## Análisis exploratorio del dataset original

### Distribución de imágenes por clase

La siguiente tabla muestra el desglose de archivos totales, imágenes legibles y tamaño por cada participante en el dataset original:

| Clase   | Imágenes legibles | Tamaño (MB) |
| ------- | ----------------: | ----------: |
| jose    |               133 |       285MB |
| juan    |                93 |       340MB |
| nicolas |               105 |       216MB |

## Resumen de calidad de los datos

Durante la exploración inicial del dataset se verificó la existencia de imágenes organizadas por participante y se identificaron los formatos presentes en la base.

El análisis permitió confirmar que:

- ⁠El dataset contiene _331 archivos de imagen_ correctamente identificados.
- ⁠Existen _cuatro formatos distintos_ de archivo: ⁠ .jpg ⁠, ⁠ .jpeg ⁠, ⁠ .png ⁠ y ⁠ .heic ⁠.
- ⁠La información se encuentra organizada por carpetas, donde cada carpeta representa una clase o participante.
- ⁠No se evidencian, en esta etapa inicial, registros faltantes en la estructura general del dataset, ya que cada imagen pertenece a una carpeta de participante.

Como acción inicial de revisión, se consolidó un resumen de cantidad de archivos por formato y por participante, lo cual permite verificar la composición de la base antes de avanzar a las siguientes etapas del proyecto.

## Preprocesamiento

El preprocesamiento se implementó como un pipeline reproducible con las siguientes etapas:

1. **Lectura de imágenes:** Se utiliza PIL como método principal con soporte para múltiples formatos (`.jpg`, `.jpeg`, `.png`, `.webp`, `.heic`, `.heif`). Se aplica corrección de orientación EXIF y conversión a RGB. OpenCV se usa como respaldo.
2. **Detección facial:** Se emplea el detector DNN de OpenCV basado en el modelo ResNet-10 SSD (`res10_300x300_ssd_iter_140000.caffemodel`) con un umbral de confianza de 0.50.
3. **Recorte del rostro:** Se recorta una región cuadrada centrada en el rostro detectado, con un factor de contexto (`target_face_ratio=0.50`) que permite incluir área alrededor del rostro.
4. **Validación del recorte:** Se verifica que el recorte tenga dimensiones mínimas (≥50 píxeles) y contenido utilizable.
5. **Redimensionamiento:** Las imágenes válidas se redimensionan a 224x224 píxeles usando interpolación `INTER_AREA`.
6. **Guardado:** Las imágenes limpias se almacenan en formato `.jpg` dentro de carpetas organizadas por clase.
7. **Trazabilidad de errores:** Las imágenes que no pueden procesarse se copian a una carpeta de errores (`imagenes_con_error`) para revisión posterior, manteniendo la organización por clase.

### Resultados del preprocesamiento

| Clase   | Procesadas | Fallidas | Total | Tasa de éxito |
| ------- | ---------: | -------: | ----: | ------------: |
| jose    |        121 |       11 |   133 |           91% |
| juan    |         90 |        3 |    93 |           97% |
| nicolas |        104 |        1 |   105 |           99% |

_Nota:_ Los valores dependen de la ejecución del pipeline de preprocesamiento, que determina qué imágenes contienen rostros detectables y cuáles no.

### Errores controlados

El pipeline maneja los siguientes tipos de error:

- **Error de lectura:** La imagen no pudo abrirse correctamente con PIL ni con OpenCV.
- **Sin rostro o recorte inválido:** No se detectó un rostro con suficiente confianza o el recorte resultó demasiado pequeño.
- **Extensión no soportada:** Archivos con extensiones diferentes a las admitidas (`.jpg`, `.jpeg`, `.png`, `.webp`, `.heic`, `.heif`).

## Dataset limpio

Después del preprocesamiento se obtiene un conjunto de datos homogéneo con las siguientes características:

| Métrica                   |  Valor |
| ------------------------- | -----: |
| Total de imágenes limpias |      — |
| Total de clases limpias   |      3 |
| Ancho mínimo              | 224 px |
| Ancho máximo              | 224 px |
| Alto mínimo               | 224 px |
| Alto máximo               | 224 px |

Todas las imágenes del dataset limpio están estandarizadas a 224x224 píxeles, en formato `.jpg` y centradas en el rostro de la persona.

## Separación del dataset en entrenamiento, validación y prueba

El dataset limpio se dividió de forma estratificada (manteniendo la proporción de clases en cada subconjunto) con la siguiente distribución:

- **Entrenamiento:** 70% de las imágenes.
- **Validación:** 15% de las imágenes.
- **Prueba:** 15% de las imágenes.

La división se realizó en dos pasos: primero se separó el 70% para entrenamiento y el 30% restante se dividió equitativamente en validación (15%) y prueba (15%).

## Diccionario de datos construido durante el análisis

| Variable    | Descripción                                     | Tipo       |
| ----------- | ----------------------------------------------- | ---------- |
| `filepath`  | Ruta completa del archivo de imagen original.   | Texto      |
| `filename`  | Nombre del archivo.                             | Texto      |
| `class`     | Identidad o clase asociada a la imagen.         | Categórica |
| `extension` | Formato del archivo original.                   | Categórica |
| `size_mb`   | Tamaño del archivo en megabytes.                | Numérica   |
| `width`     | Ancho original de la imagen en píxeles.         | Numérica   |
| `height`    | Alto original de la imagen en píxeles.          | Numérica   |
| `readable`  | Indica si la imagen pudo abrirse correctamente. | Booleana   |
| `split`     | Partición asignada: train, validation o test.   | Categórica |

## Ranking de variables

En esta etapa inicial del proyecto no se realiza un ranking de variables predictoras, ya que la base analizada corresponde principalmente a archivos de imagen y a indicadores descriptivos de su composición.

El proyecto no parte de variables tabulares tradicionales, sino de imágenes que posteriormente serán transformadas en representaciones numéricas mediante técnicas de procesamiento y redes neuronales. Por esta razón, el análisis de importancia de variables, correlaciones o componentes principales no aplica directamente en esta fase.

En etapas posteriores, el modelo podrá extraer automáticamente características visuales relevantes de los rostros, como patrones de forma, textura y distribución espacial, sin necesidad de definir manualmente un ranking de variables tradicionales.

## Relación entre variables explicativas y variable objetivo

En este conjunto de datos, la relación principal se establece entre las _imágenes_ y la _identidad del participante_, que funciona como variable objetivo.

Cada imagen se encuentra asociada a una clase específica:

- ⁠Las imágenes almacenadas en la carpeta `jose`⁠ corresponden a la clase `jose`⁠.
- ⁠Las imágenes almacenadas en la carpeta ⁠`juan`⁠ corresponden a la clase ⁠`juan`⁠.
- ⁠Las imágenes almacenadas en la carpeta ⁠`nicolas`⁠ corresponden a la clase ⁠ `nicolas`⁠.

Dado que el dataset se basa en imágenes, no se aplican análisis clásicos como matrices de correlación o diagramas de dispersión entre variables numéricas. En su lugar, la relación entre los datos de entrada y la variable objetivo será aprendida posteriormente por el modelo de deep learning a partir de las características visuales presentes en cada imagen.

El análisis exploratorio inicial permite confirmar que existe una correspondencia clara entre la estructura de carpetas y la etiqueta de clasificación, lo cual es fundamental para construir correctamente la base de entrenamiento del modelo.

## Conclusiones clave

1. El dataset original contiene 331 imágenes distribuidas en 3 clases (jose, juan, nicolas) con 4 formatos distintos (`.jpg`, `.png`, `.heic`, `.jpeg`).
2. El tamaño total del dataset original es de 842.84 MB, con tamaños de archivo y resoluciones variables.
3. Se implementó un pipeline de preprocesamiento que incluye detección facial con OpenCV DNN, recorte centrado del rostro, validación y redimensionamiento a 224x224 píxeles.
4. El pipeline maneja trazabilidad de errores, copiando las imágenes fallidas a una carpeta separada para revisión sin perder información.
5. El dataset limpio resultante contiene imágenes estandarizadas a 224x224 píxeles en formato `.jpg`, centradas en el rostro.
6. El dataset se particionó de forma estratificada en 70% entrenamiento, 15% validación y 15% prueba.
7. Se definieron dos enfoques de modelamiento: VGG16 sin data augmentation (línea base) y VGG16 con data augmentation (rotación, desplazamiento, zoom y volteo).
8. La calidad del preprocesamiento y la distribución final de los datos dependen de la ejecución del pipeline, que determina la tasa de detección facial por clase.
