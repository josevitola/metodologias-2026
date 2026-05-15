# Entendimiento del Negocio: Sistema de Reconocimiento Facial para Videoportería

## Nombre del Proyecto

Sistema Inteligente de Acceso Biométrico (SIAB) para Videoportería.

## Objetivo del Proyecto

Desarrollar, integrar y desplegar una solución de reconocimiento facial avanzada que permita a los usuarios identificar y validar a residentes y visitantes autorizados en tiempo real a través de un dispositivo de videoportería inteligente. El objetivo principal es mejorar la seguridad física de las instalaciones, ofrecer una experiencia de usuario moderna y automatizar el proceso de control de acceso, creando un nuevo diferenciador clave en nuestra línea de productos de videovigilancia.

## Alcance del Proyecto

### Incluye:

- **Captura y Procesamiento de Video:** Implementación de algoritmos de detección y extracción de características faciales (feature extraction) a partir de cámaras de alta definición.
- **Base de Datos Biométricas:** Desarrollo de una base de datos segura para el almacenamiento de plantillas faciales (embeddings) y perfiles de usuario.
- **Motor de Reconocimiento:** Desarrollo y optimización de un motor de machine learning que permita la comparación en tiempo real entre el rostro capturado y las plantillas registradas (matching).

### Excluye:

- **API de Gestión:** Creación de una API robusta para que la administración del edificio pueda registrar, actualizar y eliminar perfiles de usuario remotamente. Esto se propone como una posible fase siguiente del proyecto.

## Metodología

Se utilizará una metodología **Ágil (Scrum)** e **Iterativa**. El proyecto se dividirá en *sprints* de dos semanas, lo que permitirá un desarrollo rápido, la validación temprana con prototipos (POCs) y la adaptación continua a los *feedback* del cliente y los requisitos técnicos del hardware. Se priorizará la integración continua (CI/CD) para asegurar que el *firmware* y el *software* de gestión funcionen conjuntamente en cada etapa.

Se adoptará una metodología **TDSP (Team Data Science Process)**, lo cual es inherentemente iterativo y centrado en el ciclo de vida del los datos. Dado que la fase crítica del proyecto es el desarrollo y la optimización del modelo de inteligencia artificial, el enfoque se centrará en las siguientes fases:


## Cronograma

| Etapa | Duración Estimada | Fechas |
|------|---------|-------|
| Entendimiento del negocio y carga de datos | 1 semanas | del 07 de mayo al 14 de mayo del 2025 |
| Preprocesamiento, análisis exploratorio | 2 semanas | del 14 de mayo al 28 de mayo del 2025 |
| Modelamiento y extracción de características | 1 semanas | del 21 de mayo al 28 de mayo del 2025 |
| Despliegue | 1 semanas | del 28 de mayo al 04 de junio del 2025 |
| Evaluación y entrega final | 2 semanas | del 21 de mayo al 04 de junio del 2025 |

*Nota: Las fechas son de carácter estimativo y se ajustarán según la complejidad de las pruebas de integración y validación del hardware.*

## Equipo del Proyecto

- Ingeniero de datos: José David Nieto
- Cientifico de datos: Juan David Carrillo
- Ingeniero en ML: Nicolás Carvajal

## Presupuesto

| Categoría de Gasto | Descripción | Costo Estimado (USD) | Notas / Consideraciones |
|------|---------|-------|------|
| **I. Personal** | | | |
| Científico de Datos Senior | Diseño y optimización del modelo de reconocimiento facial (Siamese Networks/ArcFace), tuning de hiperparámetros. | $9,000 | 2.5 meses a tiempo parcial |
| Ingeniero de ML / Visión Artificial | Implementación de pipelines de detección facial (MTCNN/RetinaFace), extracción de embeddings y matching en tiempo real. | $6,500 | 3 meses a tiempo completo |
| Desarrollador Backend | API REST, base de datos de embeddings (PostgreSQL + pgvector), integración con sistemas de gestión de acceso. | $5,500 | 2 meses a tiempo completo |
| **II. Infraestructura y Hardware** | | | |
| Cámara HD para pruebas | Cámara IP de alta resolución (1080p/4K) con IR para captura en baja luminosidad. | $450 | 2 unidades para desarrollo y pruebas |
| Módulo de procesamiento edge | NVIDIA Jetson Orin Nano o similar para inferencia local en tiempo real. | $799 | Unidad de desarrollo |
| Actuadores y cerradura eléctrica | Prototipo de apertura de puerta y relevador de control. | $120 | Componentes para POC |
| Plataforma Cloud (GPU) | AWS/GCP/Azure para entrenamiento de modelos (instancias GPU A100 o V100). | $2,200 | Costos de cómputo por ~250 horas de GPU |
| Almacenamiento Cloud | S3/Blob Storage para dataset de rostros, checkpoints del modelo y backups de embeddings. | $80 | 500 GB por 3 meses |
| **III. Software y Licencias** | | | |
| Herramientas de desarrollo | Licencias de IDEs o software especializado (si aplica). | $0 | Se utilizarán herramientas open-source (Python, PyTorch/TensorFlow, ONNX Runtime) |
| Cumplimiento normativo (GDPR/LOPD) | Asesoría legal para adecuación a regulaciones de datos biométricos, redacción de consentimientos informados y DPO. | $1,200 | Consultoría externa especializada en privacidad |
| **IV. Misceláneos** | | | |
| Investigación y Desarrollo | Pruebas de concepto con distintos modelos (FaceNet, ArcFace, DeepFace), lectura de artículos y benchmarks. | $800 | Horas dedicadas a exploración y evaluación de arquitecturas |
| Gestión de Proyecto | Coordinación, reuniones, documentación del proyecto (project charter, informes, actas). | $400 | Horas de gestión distribuidas en el equipo |
| Contingencias | Fondo para imprevistos (aprox. 10% del total). | $2,705 | Buffer para retrasos, iteraciones adicionales o cambios de hardware |
| **TOTAL ESTIMADO DEL PROYECTO** | | **$29,754** | |

## Stakeholders

- **Dirección General (Management):**
    - *Relación:* Patrocinadores del proyecto y responsables de la viabilidad económica.
    - *Expectativas:* Un producto funcional, seguro, que abra una nueva línea de ingresos, y que se entregue dentro del plazo y presupuesto acordados.
- **Cliente Final (Arquitectos de Propiedad/Administradores):**
    - *Relación:* Usuario primario de la solución y fuente del *feedback* de usabilidad.
    - *Expectativas:* Un sistema de acceso fácil de usar, que sea fiable, que no cause interrupciones en el servicio y que cumpla estrictamente con las normativas de privacidad de datos.

## Aprobaciones

- José David Nieto
- Nicolás Carvajal
- Juan David Carrillo
