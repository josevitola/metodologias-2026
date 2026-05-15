# Definición de los datos

## Origen de los datos

Los datos utilizados en el proyecto corresponden a un *dataset propio de imágenes faciales de los integrantes del grupo*, construido para desarrollar un sistema de reconocimiento facial.  

La base se obtuvo a partir de fotografías organizadas previamente por participante y almacenadas en un *archivo comprimido ⁠ .zip ⁠ alojado en Google Drive*. Cada carpeta dentro del dataset representa una identidad o clase del problema de clasificación.

El archivo es descargado directamente desde Drive en el entorno de Google Colab y posteriormente descomprimido para dejar disponible la estructura de imágenes requerida en las siguientes fases del proyecto.

---

## Especificación de los scripts para la carga de datos

La carga de datos se realiza mediante un notebook en Python ejecutado en Google Colab. Los principales scripts y procedimientos utilizados son:

1.⁠ ⁠*Instalación de dependencias*
   - ⁠ gdown ⁠: utilizado para descargar archivos almacenados en Google Drive.
   - ⁠ pillow-heif ⁠: instalado para soportar la lectura de imágenes en formato ⁠ .heic ⁠ en etapas posteriores del proyecto.

2.⁠ ⁠*Descarga de archivos auxiliares*
   - Se descargan los archivos:
     - ⁠ deploy.prototxt ⁠
     - ⁠ res10_300x300_ssd_iter_140000.caffemodel ⁠
   - Estos archivos corresponden a un modelo de detección facial de OpenCV que será utilizado en fases posteriores del procesamiento de imágenes.

3.⁠ ⁠*Limpieza inicial del entorno*
   - Se eliminan posibles carpetas residuales de ejecuciones anteriores:
     - ⁠ /content/dataset_limpio ⁠
     - ⁠ /content/imagenes_con_error ⁠

4.⁠ ⁠*Descarga del dataset*
   - Se usa ⁠ gdown.download() ⁠ para obtener el archivo comprimido desde Google Drive.
   - El archivo se almacena localmente como:
     - ⁠ /content/dataset.zip ⁠

5.⁠ ⁠*Descompresión del dataset*
   - Se emplea la librería ⁠ zipfile ⁠ para extraer el contenido del archivo comprimido en:
     - ⁠ /content/dataset ⁠

6.⁠ ⁠*Definición de la ruta principal de trabajo*
   - Se define la variable:
     - ⁠ DATASET_PATH = Path("/content/dataset/dataset_preparado") ⁠

7.⁠ ⁠*Validación y caracterización inicial*
   - Se revisa la estructura de carpetas del dataset.
   - Se calcula:
     - Número total de imágenes.
     - Formatos de archivo presentes.
     - Tamaño total del dataset.
     - Cantidad de imágenes por participante.

---

## Referencias a rutas o bases de datos origen y destino

| Tipo | Ruta o referencia |
| --- | --- |
| Fuente original | Archivo ⁠ .zip ⁠ alojado en Google Drive |
| Archivo descargado en Colab | ⁠ /content/dataset.zip ⁠ |
| Carpeta de extracción | ⁠ /content/dataset ⁠ |
| Ruta principal del dataset | ⁠ /content/dataset/dataset_preparado ⁠ |
| Archivos auxiliares de detección facial | ⁠ deploy.prototxt ⁠ y ⁠ res10_300x300_ssd_iter_140000.caffemodel ⁠ |
| Carpetas limpiadas al iniciar | ⁠ /content/dataset_limpio ⁠ y ⁠ /content/imagenes_con_error ⁠ |

---

## Rutas de origen de datos

### Ubicación de los archivos de origen

El archivo de origen se encuentra almacenado en Google Drive y es descargado desde el notebook mediante un enlace público o compartido. Una vez descargado, queda disponible en la ruta:

```python
/content/dataset.zip
