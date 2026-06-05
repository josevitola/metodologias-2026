# Guía de consumo de la API

Guía práctica para consumir los endpoints de la API de reconocimiento facial **Camaleón Eyes**. Incluye ejemplos con `curl`, Python, JavaScript y WebSocket.

---

## Tabla de contenido

1. [Endpoints disponibles](#1-endpoints-disponibles)
2. [GET /health — Health check](#2-get-health--health-check)
3. [POST /api/predict/frame — Predicción de una imagen](#3-post-apipredictframe--predicción-de-una-imagen)
4. [WebSocket /ws/predict — Transmisión en tiempo real](#4-websocket-wspredict--transmisión-en-tiempo-real)
5. [Frontend (SPA) — Interfaz de usuario](#5-frontend-spa--interfaz-de-usuario)
6. [Formato de datos](#6-formato-de-datos)
7. [Códigos de error](#7-códigos-de-error)
8. [Mejores prácticas](#8-mejores-prácticas)

---

## 1. Endpoints disponibles

| Método      | Ruta                 | Descripción                                                |
| ----------- | -------------------- | ---------------------------------------------------------- |
| `GET`       | `/health`            | Verifica el estado del servidor y la carga del modelo.     |
| `POST`      | `/api/predict/frame` | Envía una imagen y obtiene las predicciones faciales.      |
| `WebSocket` | `/ws/predict`        | Conexión bidireccional para transmisión de frames en vivo. |
| `GET`       | `/` (SPA)            | Sirve la aplicación frontend compilada (single page app).  |

> **Nota**: La documentación interactiva OpenAPI/Swagger está disponible en `http://localhost:8000/docs` cuando el servidor está corriendo.

---

## 2. GET /health — Health check

Endpoint simple para verificar que el servidor está operativo y que el modelo de Keras y el clasificador Haar Cascade se cargaron correctamente.

### Ejemplo con curl

```bash
curl http://localhost:8000/health
```

### Respuesta exitosa (200 OK)

```json
{
  "status": "ok",
  "model_loaded": true,
  "model_path": "models/best_transfer_efficientnet.keras",
  "cascade_path": "/usr/local/lib/python3.11/site-packages/cv2/data/haarcascade_frontalface_default.xml"
}
```

### Campos de la respuesta

| Campo          | Tipo    | Descripción                                     |
| -------------- | ------- | ----------------------------------------------- |
| `status`       | string  | `"ok"` si el servidor está funcionando.         |
| `model_loaded` | boolean | `true` si el modelo Keras se cargó sin errores. |
| `model_path`   | string  | Ruta del archivo `.keras` en el servidor.       |
| `cascade_path` | string  | Ruta del clasificador Haar Cascade de OpenCV.   |

### Ejemplo en Python

```python
import requests

response = requests.get("http://localhost:8000/health")
data = response.json()
print(f"Estado: {data['status']}")
print(f"Modelo cargado: {data['model_loaded']}")
```

---

## 3. POST /api/predict/frame — Predicción de una imagen

Envía una imagen (JPEG, PNG, etc.) al servidor para detectar rostros y obtener predicciones del modelo.

### Parámetros

| Parámetro | Tipo    | Ubicación | Descripción                                 |
| --------- | ------- | --------- | ------------------------------------------- |
| `file`    | archivo | form-data | Imagen codificada como multipart/form-data. |

### Ejemplo con curl

```bash
curl -X POST http://localhost:8000/api/predict/frame \
  -F "file=@selfie.jpg"
```

### Respuesta exitosa (200 OK)

```json
{
  "faces_detected": 2,
  "predictions": [
    {
      "bbox": [120, 85, 200, 200],
      "predicted_class": 0,
      "confidence": 0.987,
      "scores": [0.987, 0.013]
    },
    {
      "bbox": [350, 90, 180, 180],
      "predicted_class": 1,
      "confidence": 0.92,
      "scores": [0.08, 0.92]
    }
  ]
}
```

### Campos de la respuesta

| Campo            | Tipo  | Descripción                                      |
| ---------------- | ----- | ------------------------------------------------ |
| `faces_detected` | int   | Número de rostros detectados en la imagen.       |
| `predictions`    | array | Lista de predicciones por cada rostro detectado. |

**Cada elemento de `predictions`**:

| Campo             | Tipo                   | Descripción                                                   |
| ----------------- | ---------------------- | ------------------------------------------------------------- |
| `bbox`            | `[int, int, int, int]` | Coordenadas del rectángulo del rostro: `[x, y, ancho, alto]`. |
| `predicted_class` | int o null             | Clase predicha (0, 1, ...) o `null` si confianza < umbral.    |
| `confidence`      | float o null           | Puntaje de confianza (0.0 a 1.0).                             |
| `scores`          | `[float]`              | Vector de salida softmax completa para todas las clases.      |

### Ejemplo en Python

```python
import requests

url = "http://localhost:8000/api/predict/frame"
with open("selfie.jpg", "rb") as f:
    response = requests.post(url, files={"file": f})

data = response.json()
print(f"Rostros detectados: {data['faces_detected']}")
for i, pred in enumerate(data["predictions"]):
    print(f"  Rostro {i+1}: bbox={pred['bbox']}, clase={pred['predicted_class']}, confianza={pred['confidence']:.3f}")
```

### Manejo de errores

```json
// HTTP 400 — Imagen inválida o corrupta
{
  "detail": "No se pudo decodificar la imagen"
}
```

---

## 4. WebSocket /ws/predict — Transmisión en tiempo real

Conexión WebSocket para enviar frames de video en vivo y recibir predicciones en tiempo real. Ideal para aplicaciones interactivas como filtros faciales.

### Protocolo de comunicación

```
Cliente                             Servidor
  |                                     |
  |--- (texto) Configuración inicial -->|
  |                                     |--- {"type": "ready", ...}
  |--- (binario) Frame JPEG ----------->|
  |                                     |--- {"type": "prediction", ...}
  |--- (binario) Frame JPEG ----------->|
  |                                     |--- {"type": "prediction", ...}
  |--- (binario) Frame JPEG ----------->|
  |                                     |--- {"type": "error", ...}  (si ocurre)
```

### Paso 1: Conexión y configuración inicial

Cliente se conecta y envía un mensaje de texto JSON con configuración opcional:

```json
{
  "client": "react-hook",
  "format": "jpeg",
  "width": 640,
  "height": 480
}
```

### Paso 2: Confirmación del servidor

```json
{
  "type": "ready",
  "message": "WebSocket conectado",
  "config": {
    "client": "react-hook",
    "format": "jpeg"
  }
}
```

### Paso 3: Envío de frames

Cada frame debe ser un mensaje **binario** conteniendo una imagen codificada en JPEG.

### Paso 4: Predicciones del servidor

```json
{
  "type": "prediction",
  "faces_detected": 1,
  "predictions": [
    {
      "bbox": [120, 85, 200, 200],
      "predicted_class": 0,
      "confidence": 0.987,
      "scores": [0.987, 0.013]
    }
  ]
}
```

### Tipos de mensajes del servidor

| Tipo         | Descripción                                          |
| ------------ | ---------------------------------------------------- |
| `ready`      | Conexión establecida y lista para recibir frames.    |
| `prediction` | Resultado de la predicción para un frame.            |
| `error`      | Error al procesar el frame (formato inválido, etc.). |

### Ejemplo en JavaScript (navegador)

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/predict");

ws.onopen = () => {
  console.log("Conectado al WebSocket");

  // Enviar configuración inicial
  ws.send(
    JSON.stringify({
      client: "web-browser",
      format: "jpeg",
      width: 640,
      height: 480,
    }),
  );
};

ws.onmessage = (event) => {
  // Los primeros mensajes son texto (ready, prediction, error)
  if (event.data instanceof Blob) {
    // Si el servidor enviara datos binarios
    return;
  }

  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case "ready":
      console.log("Servidor listo", msg.config);
      startSendingFrames();
      break;

    case "prediction":
      console.log(`Rostros detectados: ${msg.faces_detected}`, msg.predictions);
      // Actualizar UI con las predicciones
      break;

    case "error":
      console.error("Error del servidor:", msg.message);
      break;
  }
};

ws.onclose = () => {
  console.log("Conexión cerrada");
};

// Función para capturar frames de un video y enviarlos
function startSendingFrames() {
  const video = document.getElementById("webcam");
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");

  setInterval(() => {
    ctx.drawImage(video, 0, 0, 640, 480);
    canvas.toBlob(
      (blob) => {
        ws.send(blob);
      },
      "image/jpeg",
      0.85,
    );
  }, 200); // 5 FPS
}
```

### Ejemplo en Python (asyncio)

```python
import asyncio
import json
import cv2
import websockets

async def send_frames():
    uri = "ws://localhost:8000/ws/predict"
    async with websockets.connect(uri) as websocket:
        # Enviar configuración inicial
        await websocket.send(json.dumps({
            "client": "python-client",
            "format": "jpeg",
        }))

        # Esperar confirmación
        ready = await websocket.recv()
        print("Servidor:", ready)

        cap = cv2.VideoCapture(0)  # Cámara local

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # Codificar frame como JPEG
                _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                await websocket.send(buffer.tobytes())

                # Recibir predicción
                response = await websocket.recv()
                data = json.loads(response)
                print(f"Rostros: {data['faces_detected']}")

                await asyncio.sleep(0.1)  # ~10 FPS
        finally:
            cap.release()

asyncio.run(send_frames())
```

### Buenas prácticas para WebSocket

| Práctica                 | Recomendación                                                           |
| ------------------------ | ----------------------------------------------------------------------- |
| **Frecuencia de frames** | Enviar máximo 5-10 FPS para evitar saturar el servidor.                 |
| **Calidad JPEG**         | Usar calidad 85 (balance entre tamaño y calidad).                       |
| **Resolución**           | Redimensionar los frames a 640x480 o menor antes de enviar.             |
| **Reconexión**           | Implementar lógica de reconexión automática ante caídas.                |
| **Límite por sesión**    | El servidor no implementa límite actualmente; considerar en producción. |

---

## 5. Frontend (SPA) — Interfaz de usuario

Cuando el frontend está compilado y servido por FastAPI (opción Docker o producción), la aplicación web completa está disponible en la raíz del servidor.

### Acceso

```bash
# Abrir en el navegador
open http://localhost:8000
```

### Flujo de la aplicación

1. **Carga de modelos face-api.js**: El navegador descarga los modelos desde `/models/` (archivos en `public/models/`).
2. **Permiso de cámara**: El navegador solicita acceso a la cámara.
3. **Detección local**: face-api.js detecta rostros y puntos de referencia directamente en el navegador.
4. **Comunicación con el backend**: La aplicación puede usar WebSocket (`/ws/predict`) o REST (`POST /api/predict/frame`) para enviar frames y recibir predicciones del modelo Keras.
5. **Visualización**: Los resultados se renderizan sobre el video en vivo (bounding boxes, etiquetas, etc.).

### Componente principal

El punto de entrada de la interfaz WebSocket es el componente `FaceWsDemo.tsx`, que:

- Conecta al WebSocket del backend.
- Captura frames del video de la cámara.
- Envía frames como binario JPEG.
- Recibe predicciones y actualiza la interfaz.

---

## 6. Formato de datos

### Imágenes

- **Formato de entrada**: JPEG (recomendado), PNG.
- **Tamaño máximo**: Depende de la configuración del servidor (sin límite explícito configurado).
- **Codificación**: Las imágenes se envían como datos binarios crudos en WebSocket o como multipart/form-data en REST.

### Predicciones

El modelo EfficientNet entrenado produce un vector de puntajes softmax. Las clases dependen del conjunto de datos con el que se entrenó. Actualmente:

- `predicted_class`: Índice de la clase con mayor probabilidad.
- `confidence`: Probabilidad de la clase predicha.
- `scores`: Vector completo de probabilidades para todas las clases.

---

## 7. Códigos de error

### HTTP

| Código | Descripción           | Causa                                                       |
| ------ | --------------------- | ----------------------------------------------------------- |
| `200`  | Éxito                 | La solicitud se procesó correctamente.                      |
| `400`  | Bad Request           | La imagen no se pudo decodificar o el archivo no es válido. |
| `404`  | Not Found             | Ruta no encontrada (frontend no compilado).                 |
| `500`  | Internal Server Error | Error interno del servidor (revisar logs).                  |
| `503`  | Service Unavailable   | El modelo o recurso no está disponible.                     |

### WebSocket

Los errores se notifican con mensajes JSON:

```json
{
  "type": "error",
  "message": "Frame inválido"
}
```

| Error                 | Descripción                                           |
| --------------------- | ----------------------------------------------------- |
| `Frame inválido`      | El frame recibido no se pudo decodificar como imagen. |
| `WebSocketDisconnect` | El cliente se desconectó (manejo interno).            |

---

## 8. Mejores prácticas

### Para aplicaciones en tiempo real (WebSocket)

1. **Limitar la frecuencia de frames**: Enviar entre 5-10 FPS es suficiente para la mayoría de los casos. Más frames aumentan la carga del servidor sin mejorar significativamente la experiencia.
2. **Redimensionar imágenes**: Escalar los frames a 640x480 antes de enviarlos reduce el ancho de banda y el tiempo de procesamiento.
3. **Comprimir JPEG**: Usar calidad 85 ofrece una buena relación calidad/tamaño.
4. **Procesamiento en cliente**: face-api.js puede realizar detección facial básica en el navegador. Usar el backend solo para la clasificación con el modelo Keras cuando sea necesario.

### Para integración REST

1. **Enviar imágenes recortadas**: Si solo interesa un rostro específico, recortar la imagen antes de enviarla.
2. **Usar el health check**: Verificar que el modelo esté cargado antes de enviar solicitudes de predicción.
3. **Manejar errores**: Implementar reintentos con backoff exponencial para errores transitorios.

### Seguridad (para producción)

1. **Validar tamaño de archivos**: Implementar límites de tamaño en el servidor para evitar abusos.
2. **Autenticación**: Agregar tokens de API o JWT para controlar el acceso a los endpoints.
3. **HTTPS/WSS**: Usar TLS en producción para cifrar la comunicación.
4. **Rate limiting**: Limitar la cantidad de solicitudes por cliente para prevenir uso excesivo.

---

## Referencias

- [Especificación OpenAPI detallada](../src/reconocedor/backend/docs/api_endpoints.yaml) — Definición de esquemas y endpoints.
- [Guía de despliegue](./deployment_guide.md) — Instrucciones para ejecutar el servidor localmente o en producción.
- [Documentación de arquitectura y costos](./deploymentdoc.md) — Contexto general del despliegue.
- [Código fuente del backend](../src/reconocedor/backend/app/main.py) — Implementación de todos los endpoints.
