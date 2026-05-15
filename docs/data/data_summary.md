# Reporte de Datos

Este documento presenta los resultados del análisis exploratorio inicial del dataset utilizado en el proyecto de reconocimiento facial. El análisis se enfoca en la composición general de la base de imágenes, sus formatos, tamaño total y distribución por participante.

## Resumen general de los datos

El conjunto de datos está compuesto por *331 imágenes* correspondientes a tres participantes o clases de reconocimiento facial: *jose, **juan* y *nicolas*.

Las imágenes se encuentran almacenadas en diferentes formatos:

- *.jpg:* 163 imágenes
- *.png:* 78 imágenes
- *.heic:* 48 imágenes
- *.jpeg:* 42 imágenes

El tamaño total del dataset es de *842.84 MB*, lo que refleja que se trabaja con archivos de imagen de distintas resoluciones y formatos.

La distribución de imágenes por participante es la siguiente:

- ⁠*jose:* 133 imágenes
- ⁠*juan:* 93 imágenes
- ⁠*nicolas:* 105 imágenes

En este caso, las observaciones corresponden a archivos de imagen, mientras que la variable categórica principal asociada a cada registro es la identidad del participante.

## Resumen de calidad de los datos

Durante la exploración inicial del dataset se verificó la existencia de imágenes organizadas por participante y se identificaron los formatos presentes en la base.

El análisis permitió confirmar que:

- ⁠El dataset contiene *331 archivos de imagen* correctamente identificados.
- ⁠Existen *cuatro formatos distintos* de archivo: ⁠ .jpg ⁠, ⁠ .jpeg ⁠, ⁠ .png ⁠ y ⁠ .heic ⁠.
- ⁠La información se encuentra organizada por carpetas, donde cada carpeta representa una clase o participante.
- ⁠No se evidencian, en esta etapa inicial, registros faltantes en la estructura general del dataset, ya que cada imagen pertenece a una carpeta de participante.
- ⁠No se realizó todavía un análisis de duplicados, imágenes corruptas, calidad visual, resolución homogénea o presencia de rostros detectables, dado que estos aspectos corresponden a fases posteriores de depuración y preprocesamiento.

Como acción inicial de revisión, se consolidó un resumen de cantidad de archivos por formato y por participante, lo cual permite verificar la composición de la base antes de avanzar a las siguientes etapas del proyecto.

## Variable objetivo

La variable objetivo del proyecto es la *identidad del participante* asociado a cada imagen. Esta variable será utilizada posteriormente para entrenar un modelo de clasificación que permita reconocer a qué persona corresponde un rostro.

Los valores posibles de la variable objetivo son:

- jose ⁠
- juan ⁠
- nicolas ⁠

La distribución de la variable objetivo en el dataset es:

| Participante | Cantidad de imágenes |
| --- | ---: |
| jose | 133 |
| juan | 93 |
| nicolas | 105 |

Se observa que la clase con mayor representación es *jose, mientras que **juan* presenta la menor cantidad de imágenes. Aunque la distribución no es completamente uniforme, las tres clases cuentan con un volumen de imágenes suficiente para iniciar el proceso de modelado y posteriores etapas de balanceo o aumento de datos, si se considera necesario.

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
| --- | ---: |
| .heic | 48 |
| .jpeg | 42 |
| .png | 78 |
| .jpg | 163 |

- ⁠*Interpretación:* El formato más frecuente es ⁠ .jpg ⁠, mientras que ⁠ .jpeg ⁠ es el menos representado. Esta diversidad puede requerir conversión o normalización antes del entrenamiento del modelo.

### Tamaño total del dataset

- ⁠*Descripción:* Peso acumulado de todos los archivos de imagen.
- ⁠*Valor observado:* 842.84 MB.
- ⁠*Interpretación:* El tamaño del dataset evidencia que se trabaja con imágenes en formatos y resoluciones variables, aspecto que puede influir en el tiempo de carga y procesamiento.

### Cantidad de imágenes por participante

| Participante | Cantidad de imágenes |
| --- | ---: |
| jose | 133 |
| juan | 93 |
| nicolas | 105 |

- ⁠*Interpretación:* Esta variable permite revisar la distribución de clases. Aunque no existe un desbalance extremo, sí hay diferencias en la representación de cada participante, por lo que conviene monitorear este aspecto en la etapa de entrenamiento.

## Ranking de variables

En esta etapa inicial del proyecto no se realiza un ranking de variables predictoras, ya que la base analizada corresponde principalmente a archivos de imagen y a indicadores descriptivos de su composición.

El proyecto no parte de variables tabulares tradicionales, sino de imágenes que posteriormente serán transformadas en representaciones numéricas mediante técnicas de procesamiento y redes neuronales. Por esta razón, el análisis de importancia de variables, correlaciones o componentes principales no aplica directamente en esta fase.

En etapas posteriores, el modelo podrá extraer automáticamente características visuales relevantes de los rostros, como patrones de forma, textura y distribución espacial, sin necesidad de definir manualmente un ranking de variables tradicionales.

## Relación entre variables explicativas y variable objetivo

En este conjunto de datos, la relación principal se establece entre las *imágenes* y la *identidad del participante*, que funciona como variable objetivo.

Cada imagen se encuentra asociada a una clase específica:

- ⁠Las imágenes almacenadas en la carpeta `jose`⁠ corresponden a la clase `jose`⁠.
- ⁠Las imágenes almacenadas en la carpeta ⁠`juan`⁠ corresponden a la clase ⁠`juan`⁠.
- ⁠Las imágenes almacenadas en la carpeta ⁠`nicolas`⁠ corresponden a la clase ⁠ `nicolas`⁠.

Dado que el dataset se basa en imágenes, no se aplican análisis clásicos como matrices de correlación o diagramas de dispersión entre variables numéricas. En su lugar, la relación entre los datos de entrada y la variable objetivo será aprendida posteriormente por el modelo de deep learning a partir de las características visuales presentes en cada imagen.

El análisis exploratorio inicial permite confirmar que existe una correspondencia clara entre la estructura de carpetas y la etiqueta de clasificación, lo cual es fundamental para construir correctamente la base de entrenamiento del modelo.
