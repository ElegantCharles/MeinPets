# MeinPets

<p align="center">
  <img src="assets/logo.png" alt="MeinPets" width="180">
</p>

## 1. Descripción del proyecto
MeinPets es una aplicación móvil para el cuidado y la gestión de la salud de mascotas, orientada a
dueños de perros y gatos de la Región de Valparaíso.

Resuelve dos problemas que hoy quedan sin cubrir. El primero es la falta de un registro
centralizado: la información médica de una mascota vive repartida entre carnets de papel,
fotos en el teléfono y la memoria del dueño. El segundo es la búsqueda de atención: las
aplicaciones de mapas de uso general no distinguen entre una veterinaria, un laboratorio
clínico, una peluquería canina o una tienda de alimentos, por lo que encontrar el servicio
correcto en una urgencia es lento y poco confiable.

La aplicación permite crear un perfil por mascota con sus datos y su historial, llevar el
control de vacunas y desparasitaciones con recordatorios en el calendario del teléfono, y
localizar establecimientos de atención animal cercanos filtrados por categoría.

## 2. Tecnologías utilizadas
- **Lenguajes:** TypeScript
- **Aplicación móvil:** React Native + Expo · MapLibre (mapa) · expo-calendar · expo-location
- **Backend / API:** Node.js + Express
- **Base de datos:** PostgreSQL 16 + PostGIS (contenedor Docker)
- **Datos geográficos:** OpenStreetMap, importados vía Overpass API a PostGIS
- **Cloud / Infraestructura:** Docker + Docker Compose

## 3. Instrucciones para ejecutar el proyecto localmente

### Estructura del repositorio
El repositorio sigue la estructura por fases de la asignatura. El sistema se ejecuta desde
`FASE 2/Evidencias Proyecto/Evidencias de sistema/`.

```
FASE 1/
  Evidencias Grupales/          Formativa y Guía de definición del proyecto
  Evidencias Individuales/      Autoevaluaciones y diarios de reflexión
FASE 2/
  Evidencias Grupales/          Guías e informes de avance y final
  Evidencias Individuales/      Diarios de reflexión y autoevaluaciones
  Evidencias Proyecto/
    Presentacion Proyecto/
    Evidencias de documentacion/
      arquitectura/             Modelo de arquitectura 4+1
      api/                      Documentación de los endpoints
      manual-de-usuario/
    Evidencias de sistema/
      aplicacion/
        movil/                  Aplicación React Native (Expo)
        api/                    API REST (Node.js + Express)
      base-de-datos/
        scripts/                DDL, datos iniciales e importación desde OpenStreetMap
        modelo/                 Diagrama entidad-relación
      docker-compose.yml
      .env.example
FASE 3/
  Evidencias Grupales/          Presentación final
  Evidencias Individuales/      Diarios de reflexión y autoevaluaciones
assets/                         Logo e imágenes del proyecto
README.md
```

### Requisitos previos
- Docker Desktop (en ejecución) y Docker Compose

### Puesta en marcha (Base de datos + API + Aplicación móvil)
Todo el entorno (base de datos, servidor API e interfaz móvil) está contenerizado y se levanta con un único comando mediante Docker Compose, sin necesidad de instalar Node.js ni dependencias manualmente en el equipo local:

```bash
# 1. Clonar el repositorio y entrar a la carpeta del sistema
git clone https://github.com/ElegantCharles/PetMap.git
cd "PetMap/FASE 2/Evidencias Proyecto/Evidencias de sistema"

# 2. Construir y levantar todos los contenedores
docker compose up --build
```
*(Si ya levantó el proyecto en semanas anteriores y desea recrear el volumen de base de datos limpio desde cero, ejecute antes `docker compose down -v`).*

Esto levantará automáticamente tres contenedores:
* **`meinpets_db`** (`puerto 5432`): instancia de PostgreSQL 16 con PostGIS y ejecución automática de los scripts en `base-de-datos/scripts/` (codificados en UTF-8 sin BOM):
  * `01_init.sql`: configuración `client_encoding = 'UTF8'` y habilitación de la extensión `postgis`.
  * `02_schema.sql`: creación del esquema relacional (`usuarios`, `especies`, `razas`, `mascotas`, `usuarios_mascotas`, `catalogo_tratamientos`, `historial_tratamientos` y `establecimientos`) e índices espaciales GiST.
  * `03_seed.sql`: carga inicial idempotente de especies (`Perro`, `Gato`), razas frecuentes, catálogo de vacunas y antiparasitarios (internos y externos) con sus descripciones clínicas e intervalos de refuerzo sugeridos, usuario de prueba y establecimientos.
  * `04_add_tratamientos_descripcion.sql`: migración idempotente que asegura la columna `descripcion` y sus textos en bases de datos preexistentes.
* **`meinpets_api`** (`puerto 3000`): servidor API REST (Node.js + Express) conectado a la base de datos con soporte de autenticación mediante hash `bcrypt` y tokens `JWT`, además de verificación idempotente de los scripts SQL al iniciar.
* **`meinpets_movil`** (`puerto 8081`): cliente de la aplicación móvil (React Native + Expo) empaquetado para navegador web y conectado automáticamente a `http://localhost:3000/api`.

---

### Visualización de la aplicación móvil

Una vez que los tres contenedores estén en ejecución:

1. Abrir el navegador web en **`http://localhost:8081`**.
2. Para visualizar la interfaz con las proporciones exactas de un teléfono, se recomienda presionar **`F12`** (Herramientas para desarrolladores) y activar el icono de **vista de dispositivo móvil** (*Toggle device toolbar* o `Ctrl + Shift + M`).
3. Ingresar con las credenciales de prueba precargadas o registrar una cuenta nueva desde **Crear cuenta nueva**:
   - **Correo electrónico:** `demo@meinpets.cl`
   - **Contraseña:** `Password123`

Podrá interactuar y navegar entre las pantallas de **Iniciar Sesión**, **Crear Cuenta**, **Mis Mascotas**, **Registrar Mascota**, **Ficha de Mascota y Carnet Sanitario**, **Registrar Dosis**, **Calendario de Refuerzos** y **Mapa**.

---

### Verificación y endpoints de la API

La API queda disponible en `http://localhost:3000` (y bajo el prefijo `http://localhost:3000/api`).

Para comprobar el estado del servidor y la conexión con PostGIS:
- **Ruta de verificación:** `http://localhost:3000/health` (o `http://localhost:3000/api/health`)
- **Respuesta esperada:**
  ```json
  {
    "status": "ok",
    "timestamp": "...",
    "database": {
      "connected": true,
      "postgis": "3.4 USE_GEOS=1 USE_PROJ=1 USE_STATS=1"
    }
  }
  ```

#### Endpoints disponibles en la API

**1. Autenticación y perfil**

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Registro de usuario (`nombre_completo`, `email`, `password`) con validación de formato, complejidad de clave y hash `bcrypt`. Devuelve `201` o `409` si el correo ya existe. |
| `POST` | `/api/auth/login` | Inicio de sesión (`email`, `password`). Verifica credenciales y emite un token `JWT` junto con los datos públicos del perfil (`200`) o `401` ante credenciales inválidas. |
| `GET` | `/api/auth/me` | Ruta protegida mediante header `Authorization: Bearer <token>`. Devuelve el perfil del usuario autenticado (`200`) o `401` si el token falta, es inválido o expiró. |

**2. Catálogo de especies, mascotas y cotutores**

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/species` | Catálogo público de especies (`Perro`, `Gato`) con su listado anidado de razas. |
| `GET` | `/api/species/:id/breeds` | Listado de razas pertenecientes a una especie específica. |
| `GET` | `/api/pets` | Lista las mascotas asociadas al usuario autenticado (como tutor principal o cotutor). |
| `POST` | `/api/pets` | Registra una nueva mascota (`nombre`, `especie_id`, `raza_id`, `fecha_nacimiento`, `sexo`, `esterilizado`, `numero_chip`) y asocia al usuario como tutor principal. |
| `GET` | `/api/pets/:id` | Obtiene el detalle de la mascota junto con la lista de sus tutores registrados. |
| `PUT` | `/api/pets/:id` | Actualiza los datos de la mascota (solo accesible para sus tutores). |
| `DELETE` | `/api/pets/:id` | Elimina la ficha de la mascota y su historial sanitario asociado. |
| `POST` | `/api/pets/:id/tutors` | Asocia un familiar o cotutor adicional a la mascota a partir de su `email` registrado. |

**3. Carnet sanitario (vacunas y antiparasitarios) y calendario**

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/treatments` | Catálogo de vacunas, antiparasitarios internos y antiparasitarios externos (filtrable por `?especie_id=`), incluyendo `descripcion` corta y `dias_sugeridos_refuerzo`. |
| `GET` | `/api/pets/:id/treatments` | Historial sanitario de la mascota ordenado desde la aplicación más reciente, con cálculo de `estado_refuerzo` (`atrasado`, `proximo`, `vigente`, `sin_refuerzo`) y `dias_restantes`. |
| `POST` | `/api/pets/:id/treatments` | Registra una dosis aplicada (`tratamiento_id`, `fecha_aplicacion`, `fecha_proximo_refuerzo`, `clinica_nombre`, `veterinario_nombre`, `observaciones`). Si no se envía fecha de refuerzo, la calcula automáticamente según el catálogo. |
| `PUT` | `/api/pets/:id/treatments/:recordId` | Edita una dosis existente del carnet sanitario de la mascota. |
| `DELETE` | `/api/pets/:id/treatments/:recordId` | Elimina un registro de dosis del carnet sanitario. |
| `GET` | `/api/calendar` | Consolida todos los próximos refuerzos de las mascotas del usuario ordenados por urgencia (fecha de próximo refuerzo ascendente). |

Para detener los contenedores:
```bash
docker compose down
```

## 4. Integrantes del equipo y roles
| Integrante | Rol |
|---|---|
| Malhue, Javier |Líder de proyecto y base de datos. Coordina al equipo, representa al grupo ante la docente, diseña y gestiona el modelo de base de datos. |
| Altamirano, Sebastian | Control de calidad y pruebas. Define los casos de prueba, valida cada entrega y detecta errores antes de la revisión. |
| Echeverria, Carlos | Desarrollo backend y frontend. Construye la API, la aplicación móvil y el despliegue en la nube. |

## 5. Metodología de trabajo
Scrum, con sprints de una semana. Cada sprint cierra en la sesión semanal con la docente, que
funciona como revisión de avance. El trabajo se organiza en un tablero de GitHub Projects y el
código se versiona en este repositorio.

Cada sprint contempla cuatro etapas:

1. **Planificación** — definición de historias de usuario a partir del backlog.
2. **Desarrollo e integración** — codificación modular de las funcionalidades priorizadas.
3. **Revisión y pruebas** — validación de cada módulo antes de darlo por terminado.
4. **Retroalimentación y ajustes** — corrección de errores y mejoras de la experiencia de uso.

El semestre se divide en tres fases: definición del proyecto, desarrollo incremental por módulos
y cierre con validación y presentación final.

Las tareas realizadas en cada sprint semanal son detalladas y monitoreadas con la herramienta de Github Project, conteniendo tanto el Product Backlog como el Sprint Backlog de las fases del proyecto. El enlace se dejará adjunto debajo de este parrafo para facilitar la lectura y la revisión del proyecto. 

Link Github Project: https://github.com/users/ElegantCharles/projects/2

## 6. Arquitectura de la solución
La solución sigue una arquitectura cliente-servidor de tres capas:

```
  Aplicación móvil            API REST                Base de datos
  React Native + Expo   ──►   Node.js + Express  ──►  PostgreSQL + PostGIS
        │                          │
        │                          └── consultas geoespaciales por cercanía
        │
        ├── calendario del dispositivo (recordatorios de vacunas)
        ├── mapa MapLibre sobre OpenStreetMap
        └── enlaces profundos a Google Maps (navegación y reseñas)
```

La API y la base de datos se ejecutan como contenedores definidos en `docker-compose.yml`. La
aplicación móvil se compila e instala en el dispositivo y consume la API por red.

La arquitectura se documenta con el modelo **4+1** (vistas lógica, de procesos, de desarrollo,
física y de escenarios) en `FASE 2/Evidencias Proyecto/Evidencias de documentacion/arquitectura/`,
junto con la descripción de los endpoints de la API.

Los establecimientos de atención animal se importan una única vez desde OpenStreetMap hacia
PostGIS, lo que permite realizar las búsquedas por cercanía sobre la base de datos propia sin
depender de servicios externos en tiempo de ejecución.

## 7. Convención de ramas y flujo de trabajo (Git / Pull Requests)

Para mantener un historial de versiones limpio y garantizar la estabilidad del código, el equipo adopta un flujo basado en dos ramas de largo plazo (`main` y `dev`) y ramas temporales por tarea.

### 7.1 Estructura de ramas principales
- **`main`**: Código estable y probado, representativo de las entregas oficiales del proyecto. Rechaza pushes directos.
- **`dev`**: Rama principal de desarrollo e integración diaria. Contiene los últimos avances validados durante el sprint. Rechaza pushes directos.

---

### 7.2 Nomenclatura de commits
Todas las ramas de trabajo se deben crear obligatoriamente a partir de **`dev`** y seguir la convención:

`<tipo>/sprint<N>/<descripcion-corta>`

#### Tipos de trabajo (`<tipo>`):
- **`feat`**: Desarrollo de nuevas funcionalidades.
- **`fix`**: Corrección de errores o bugs.
- **`db`**: Cambios en la base de datos (scripts DDL, PostGIS, datos iniciales).
- **`docs`**: Documentación (README, manuales, arquitectura).

---

### 7.3 Flujo de trabajo y Pull Requests (PR)

1. **Creación de la rama:**
   Actualiza la rama `dev` e inicia tu trabajo:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b <tipo>/sprint<N>/<descripcion-corta>
   ```

2. **Commits y push:**
   Registra tus cambios con commits descriptivos y publica la rama remota:
   ```bash
   git push origin <tipo>/sprint<N>/<descripcion-corta>
   ```

3. **Pase a producción / entrega final (`dev` ➔ `main`):**
   - Al finalizar el sprint, se pasa de **`dev` hacia `main`**.
   - Tras la validación final del equipo, se fusiona en `main`.


---
### Sección de innovación (documento de cierre)
- **¿Qué problema resuelve?** La gestión dispersa de la información de salud de una mascota y la
  dificultad para encontrar el tipo correcto de servicio veterinario en las cercanías.
- **¿Qué hace diferente a la solución?** Combina el historial de salud de la mascota con un
  buscador que distingue entre veterinaria, laboratorio clínico, peluquería y tienda, categorías
  que las aplicaciones de mapas de uso general no separan. Los recordatorios de vacunación se
  integran con el calendario que el usuario ya utiliza, en lugar de vivir aislados en la
  aplicación.
- **¿Qué valor agrega?** Reduce el tiempo de búsqueda de atención en situaciones de urgencia y
  evita que se pierdan controles de vacunación y desparasitación por falta de registro.
