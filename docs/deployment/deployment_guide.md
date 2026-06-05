# Guía de despliegue

Guía práctica paso a paso para desplegar y ejecutar la aplicación de reconocimiento facial **Camaleón Eyes** en distintos entornos: desarrollo local, contenedor Docker y producción en AWS.

---

## Tabla de contenido

1. [Prerrequisitos](#1-prerrequisitos)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Opción A: Desarrollo local (frontend y backend separados)](#3-opción-a-desarrollo-local-frontend-y-backend-separados)
4. [Opción B: Contenedor Docker unificado](#4-opción-b-contenedor-docker-unificado)
5. [Opción C: Despliegue en AWS](#5-opción-c-despliegue-en-aws)
6. [Verificación del despliegue](#6-verificación-del-despliegue)
7. [Solución de problemas comunes](#7-solución-de-problemas-comunes)

---

## 1. Prerrequisitos

| Herramienta                                   | Versión mínima | Propósito                                     |
| --------------------------------------------- | -------------- | --------------------------------------------- |
| [Python](https://www.python.org/downloads/)   | 3.11           | Backend FastAPI y modelo Keras                |
| [uv](https://docs.astral.sh/uv/)              | Recomendado    | Gestor de paquetes Python (alternativa a pip) |
| [Node.js](https://nodejs.org/)                | 22             | Frontend React + Vite                         |
| [pnpm](https://pnpm.io/installation)          | 9+             | Gestor de paquetes del frontend               |
| [Docker](https://docs.docker.com/get-docker/) | 24+            | Contenedor unificado (opcional)               |
| [Git](https://git-scm.com/)                   | Cualquiera     | Control de versiones                          |

### Verificar instalaciones

```bash
python --version   # >= 3.11
uv --version       # (opcional, recomendado para instalar dependencias Python)
node --version     # >= 22
pnpm --version     # >= 9
docker --version   # >= 24 (si se usa Docker)
```

### Clonar el repositorio

```bash
git clone git@github.com:josevitola/metodologias-2026.git
cd metodologias-2026/src/reconocedor
```

---

## 2. Estructura del proyecto

```
src/reconocedor/
├── Dockerfile                  # Construcción multi-etapa (frontend + backend)
├── docker-compose.yml          # Orquestación del contenedor
├── backend/                    # Código del backend (FastAPI + Keras)
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py             # Punto de entrada de la API
│   │   ├── config.py           # Configuración (rutas, umbrales)
│   │   ├── schemas.py          # Modelos Pydantic
│   │   └── utils.py            # Utilidades (detección, predicción)
│   └── models/
│       └── best_transfer_efficientnet.keras   # Modelo entrenado
├── frontend/                   # Código del frontend (React + Vite + TS)
│   ├── package.json
│   ├── vite.config.ts
│   ├── public/models/          # Modelos face-api.js
│   └── src/                    # Componentes React
└── backend/docs/
    └── api_endpoints.yaml      # Especificación OpenAPI de los endpoints
```

---

## 3. Opción A: Desarrollo local (frontend y backend separados)

Recomendada para desarrollo activo, ya que permite hot-reload en ambos lados.

### 3.1 Backend (FastAPI)

```bash
cd src/reconocedor/backend

# Crear y activar entorno virtual (opcional pero recomendado)
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows

# Instalar dependencias (se recomienda uv por su velocidad)
# Opción A: con uv
uv pip install -r requirements.txt

# Opción B: con pip
pip install -r requirements.txt
```

Iniciar el servidor:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

El backend estará disponible en `http://localhost:8000`.

- Documentación interactiva de la API: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- La opción `--reload` reinicia el servidor automáticamente al detectar cambios en el código.

### 3.2 Frontend (React + Vite)

En otra terminal:

```bash
cd src/reconocedor/frontend

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

El frontend estará disponible en `http://localhost:5173`.

- El servidor de desarrollo de Vite se comunica con el backend en `localhost:8000`.
- Los cambios en el código se reflejan automáticamente (hot module replacement).
- Si se necesita cambiar el puerto o la URL del backend, modificar `vite.config.ts`.

### 3.3 Flujo de trabajo en desarrollo

1. Iniciar el backend (`uvicorn ... --reload`).
2. Iniciar el frontend (`pnpm dev`).
3. Abrir `http://localhost:5173` en el navegador.
4. Conceder permisos de cámara cuando el navegador lo solicite.
5. La aplicación cargará los modelos face-api.js desde `public/models/` y comenzará la detección facial.

---

## 4. Opción B: Contenedor Docker unificado

Recomendada para pruebas integradas, demostraciones o despliegues sencillos. El contenedor empaqueta el frontend compilado y el backend en una sola imagen.

### 4.1 Construir la imagen

```bash
cd src/reconocedor

docker build -t reconocedor:latest .
```

El proceso:

1. **Stage 1 (frontend-build)**: Compila el frontend React con Vite usando Node.js 22 Alpine.
2. **Stage 2 (runtime)**: Construye la imagen final con Python 3.11-slim, instala las dependencias Python, copia el backend y el frontend compilado.

### 4.2 Ejecutar el contenedor

```bash
# Usando docker run
docker run -d --name reconocedor -p 8000:8000 --restart unless-stopped reconocedor:latest

# O usando docker-compose
docker compose up -d
```

### 4.3 Verificar

```bash
# Health check
curl http://localhost:8000/health

# Ver logs
docker logs reconocedor -f
```

### 4.4 Comandos útiles

```bash
# Detener el contenedor
docker stop reconocedor

# Reiniciar
docker restart reconocedor

# Eliminar contenedor e imagen
docker rm -f reconocedor
docker rmi reconocedor:latest

# Reconstruir sin usar caché
docker build --no-cache -t reconocedor:latest .
```

### 4.5 Notas sobre el Dockerfile

| Aspecto                | Detalle                                                                    |
| ---------------------- | -------------------------------------------------------------------------- |
| **Multi-etapa**        | Reduce el tamaño de la imagen final al separar la compilación del frontend |
| **Compatible ARM/AMD** | Base `python:3.11-slim` funciona en arquitecturas arm64 y amd64            |
| **OpenCV**             | Se instalan `libgl1` y `libglib2.0` para compatibilidad con OpenCV         |
| **Frontend estático**  | FastAPI sirve los archivos compilados desde `./frontend/dist/`             |
| **Health check**       | Cada 30s se verifica el endpoint `/health`                                 |

---

## 5. Opción C: Despliegue en AWS

Para un despliegue productivo básico. Ver el documento [`deploymentdoc.md`](./deploymentdoc.md) para detalles de arquitectura, costos y escalabilidad.

### 5.1 Subir la imagen a Amazon ECR

```bash
# Autenticar Docker con ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Crear repositorio (si no existe)
aws ecr create-repository --repository-name reconocedor --region us-east-1

# Etiquetar y subir la imagen
docker tag reconocedor:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/reconocedor:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/reconocedor:latest
```

### 5.2 Ejecutar en EC2

```bash
# Conectarse a la instancia EC2 (Amazon Linux 2023 o Ubuntu 22.04)
ssh -i <key.pem> ec2-user@<ec2-public-dns>

# Instalar Docker (si no está instalado)
sudo yum install -y docker  # Amazon Linux
sudo systemctl start docker

# Autenticar y descargar la imagen
aws ecr get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
sudo docker pull <account-id>.dkr.ecr.us-east-1.amazonaws.com/reconocedor:latest

# Ejecutar el contenedor
sudo docker run -d --name reconocedor -p 80:8000 --restart unless-stopped <account-id>.dkr.ecr.us-east-1.amazonaws.com/reconocedor:latest
```

### 5.3 Ejecutar en ECS con Fargate

1. Crear un clúster ECS (Fargate).
2. Definir una definición de tarea apuntando a la imagen en ECR, puerto 8000.
3. Crear un servicio ECS con balanceador de carga ALB (opcional para exposición pública).
4. Configurar auto-escalado según CPU/memoria.

### 5.4 Variables de entorno (opcional)

Si se requiere configurar el comportamiento en producción, se pueden pasar variables de entorno al contenedor:

```bash
docker run -d -p 8000:8000 \
  -e CONFIDENCE_THRESHOLD=0.5 \
  -e LOG_LEVEL=info \
  --name reconocedor reconocedor:latest
```

Actualmente, la configuración se lee de [`config.py`](../src/reconocedor/backend/app/config.py). Para producción, se recomienda externalizar la configuración con variables de entorno.

---

## 6. Verificación del despliegue

### 6.1 Health check

```bash
curl http://localhost:8000/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "model_loaded": true,
  "model_path": "models/best_transfer_efficientnet.keras",
  "cascade_path": "/usr/local/lib/python3.11/site-packages/cv2/data/haarcascade_frontalface_default.xml"
}
```

### 6.2 Frontend

Abrir en el navegador:

- **Local (desarrollo)**: `http://localhost:5173`
- **Docker / producción**: `http://localhost:8000` (FastAPI sirve el SPA)

La aplicación debe:

1. Cargar los modelos face-api.js (puede tomar unos segundos).
2. Solicitar permiso de cámara.
3. Mostrar el video en vivo con detección facial.

### 6.3 Endpoints de la API

Ver la [guía de consumo de API](./api_consumption.md) para ejemplos detallados de uso de cada endpoint.

---

## 7. Solución de problemas comunes

| Problema                                            | Causa posible                    | Solución                                                          |
| --------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| `ModuleNotFoundError: No module named 'cv2'`        | Falta OpenCV                     | `pip install opencv-python`                                       |
| `No se pudo cargar el clasificador Haar Cascade`    | Ruta del clasificador incorrecta | Verificar que OpenCV esté instalado correctamente                 |
| El frontend muestra pantalla en blanco              | El backend no está corriendo     | Iniciar el backend con `uvicorn` o Docker                         |
| `curl: (56) Recv failure: Connection reset by peer` | El modelo no se cargó            | Revisar logs: `docker logs reconocedor`                           |
| Error al construir la imagen Docker                 | Falta memoria o disco            | `docker system prune` y reintentar                                |
| La cámara no se activa                              | Permisos del navegador           | Verificar que el navegador tenga permiso para acceder a la cámara |
| `pnpm: command not found`                           | pnpm no está instalado           | `npm install -g pnpm` o `corepack enable`                         |
| WebSocket se desconecta                             | Timeout o red inestable          | Verificar conectividad de red y reiniciar la aplicación           |

---

## Referencias

- [Documentación de despliegue, infraestructura y costos](./deploymentdoc.md) — Arquitectura propuesta, estimación de costos y escalabilidad.
- [Especificación de la API (OpenAPI)](../src/reconocedor/backend/docs/api_endpoints.yaml) — Definición detallada de los endpoints.
- [Guía de consumo de API](./api_consumption.md) — Ejemplos prácticos de uso de cada endpoint.
