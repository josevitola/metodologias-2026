# Diccionario de datos

## Base de datos

Esta base de datos corresponde al conjunto de imágenes originales utilizado en el proyecto de reconocimiento facial. El dataset fue descargado desde un archivo comprimido alojado en Google Drive, descomprimido en el entorno de trabajo y organizado en carpetas por participante. En total contiene *331 imágenes* distribuidas entre *3 clases o identidades*:  `jose`⁠, `juan`⁠ y⁠ `nicolas`⁠.

| Variable | Descripción | Tipo de dato | Rango/Valores posibles | Fuente de datos |
| --- | --- | --- | --- | --- |
| imagen | Archivo de imagen correspondiente al rostro o fotografía de un participante. | Archivo de imagen | Formatos ⁠ .jpg ⁠, ⁠ .jpeg ⁠, ⁠ .png ⁠, ⁠ .heic ⁠ | Dataset propio descargado desde Google Drive |
| participante | Identidad o clase asociada a cada imagen, determinada por la carpeta en la que se encuentra almacenada. | Categórico / Texto | ⁠ jose ⁠, ⁠ juan ⁠, ⁠ nicolas ⁠ | Estructura de carpetas del dataset |
| formato_archivo | Extensión o tipo de archivo de cada imagen. | Categórico / Texto | ⁠ .jpg ⁠, ⁠ .jpeg ⁠, ⁠ .png ⁠, ⁠ .heic ⁠ | Propiedades de los archivos del dataset |
| ruta_archivo | Ubicación de cada imagen dentro de la estructura del dataset en el entorno de ejecución. | Texto | Rutas dentro de ⁠ /content/dataset/dataset_preparado/ ⁠ | Directorio de almacenamiento generado tras la descompresión |
| tamaño_archivo | Peso individual de cada archivo de imagen. | Numérico | Valor variable en bytes o MB según cada imagen | Propiedades de los archivos del dataset |

- ⁠*Variable*: nombre del atributo identificado en la base de imágenes.
- ⁠*Descripción*: breve explicación del contenido o función de la variable.
- ⁠*Tipo de dato*: naturaleza del dato almacenado.
- ⁠*Rango/Valores posibles*: valores observados o categorías posibles dentro del dataset.
- ⁠*Fuente de datos*: origen del dato dentro del proceso de carga.
