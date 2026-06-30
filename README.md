# Sistema de Parqueadero — Microservicios Distribuidos

Proyecto de la materia **Aplicaciones Distribuidas** (ESPE). Sistema de gestión de parqueadero compuesto por 5 microservicios independientes, un API Gateway (Kong) y un frontend en React.

**Autores:** Wilmer Buestan, Germán Cáceres, Jefferson Masapanta

---

## 1. Arquitectura del sistema

```
                         ┌─────────────────────┐
                         │   Frontend React    │
                         │  (localhost:5173)    │
                         └──────────┬───────────┘
                                    │ fetch
                                    ▼
                         ┌─────────────────────┐
                         │   Kong API Gateway   │
                         │  (localhost:8000)     │
                         └──────────┬───────────┘
                                    │
     ┌──────────────┬───────────┬───┴───────┬──────────────┬──────────────┐
     ▼              ▼           ▼           ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ personas │ │vehiculos │ │  zonas   │ │ tickets  │ │ asignaciones │
│ (NestJS) │ │ (NestJS) │ │(Spring)  │ │ (NestJS) │ │   (NestJS)   │
│ :3001    │ │ :3002    │ │ :3003    │ │ :3004    │ │    :3005     │
│ + JWT    │ │ + JWT    │ │          │ │ + JWT    │ │   + JWT      │
└──────────┘ └──────────┘ └──────────┘ └────┬─────┘ └──────────────┘
                                             │
                               tickets-service llama directo
                               (sin Kong) a los otros servicios
                               para orquestar entrada/salida
```

**Qué hace cada parte:**

- **personas-service**: gestión de personas, usuarios y roles. Autenticación JWT — genera el token en `POST /auth/login`.
- **vehiculos-service**: gestión de vehículos con herencia de tabla (Auto, Camioneta, Motocicleta). Búsqueda por placa y disponibilidad.
- **zonas-service**: gestión de zonas de parqueo y espacios individuales (estados: LIBRE / OCUPADO / RESERVADO / MANTENIMIENTO).
- **tickets-service**: orquestador. Al emitir un ticket de entrada coordina 6 pasos: valida persona, vehículo, zona; asigna espacio; crea el ticket. En la salida calcula la tarifa ($2.50/hora) y libera el espacio.
- **asignaciones-service**: asignación de vehículos a propietarios (clave compuesta), con auditoría automática por Domain Events.
- **Kong**: único punto de entrada externo. El frontend solo conoce la URL de Kong.
- **Frontend React**: dashboard con formularios para tickets, personas, vehículos, zonas y asignaciones.

---

## 2. Prerrequisitos (instalar antes de clonar)

Necesitas: **Node.js**, **Java 25**, **Docker** y **Git**.

### 2.1 Node.js (v20 o superior)

**Windows:**
1. Descarga el instalador desde https://nodejs.org (elige la versión **LTS**).
2. Verifica:
   ```
   node -v
   npm -v
   ```

**Mac:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2 Java 25 (JDK)

Este proyecto usa Java 25. Descarga desde https://adoptium.net o https://jdk.java.net/25/

**Windows:** ejecuta el instalador `.msi`, activa la opción "Set JAVA_HOME variable".

**Mac:**
```bash
brew install openjdk@25
```

**Linux:**
```bash
sudo apt install openjdk-25-jdk
```

Verifica:
```bash
java -version   # debe mostrar version "25.x.x"
```

### 2.3 Docker

**Windows / Mac:** instala **Docker Desktop** desde https://www.docker.com/products/docker-desktop

**Linux:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

> ⚠️ **Docker Desktop debe estar ABIERTO** cada vez que uses el proyecto. Ábrelo manualmente antes de levantar el sistema.

### 2.4 Git

**Windows:** https://git-scm.com/download/win | **Mac:** `brew install git` | **Linux:** `sudo apt install git`

---

## 3. Clonar el proyecto

```bash
git clone https://github.com/WilmerBuestan/Parking_distribuidos.git
cd Parking_distribuidos
```

Estructura:

```
Parking_distribuidos/
├── backend-personas/      (NestJS, puerto 3001) — Auth JWT + personas + roles
├── vehiculos/             (NestJS, puerto 3002)
├── zonas/                 (Spring Boot, puerto 3003)
├── tickets-service/       (NestJS, puerto 3004)
├── asignaciones-service/  (NestJS, puerto 3005) — Asignación y Trazabilidad
├── kong/                  (configuración del API Gateway)
├── frontend/              (React + Vite + Tailwind)
└── levantar-sistema.sh    (script de arranque, solo Linux/Mac)
```

---

## 4. Configuración inicial (una sola vez)

### 4.1 Levantar PostgreSQL con Docker

Este proyecto usa un contenedor Docker para la base de datos. La primera vez:

```bash
docker run -d --name finanzas_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=admin123 \
  -p 5432:5432 \
  postgres:16
```

Luego crear las 5 bases de datos:

```bash
docker exec -it finanzas_postgres psql -U postgres -c "CREATE DATABASE db_personas;"
docker exec -it finanzas_postgres psql -U postgres -c "CREATE DATABASE gestion_vehiculos;"
docker exec -it finanzas_postgres psql -U postgres -c "CREATE DATABASE zonas_db;"
docker exec -it finanzas_postgres psql -U postgres -c "CREATE DATABASE db_tickets;"
docker exec -it finanzas_postgres psql -U postgres -c "CREATE DATABASE db_asignaciones;"
```

Si ya existe el contenedor de sesiones anteriores, solo arráncalo:
```bash
docker start finanzas_postgres
```

### 4.2 Crear los archivos `.env`

**Estos archivos NO se suben a Git** (están en `.gitignore`). Cada quien debe crearlos.

**`backend-personas/.env`:**
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USUARIO=postgres
DB_CONTRASENA=admin123
DB_NOMBRE=db_personas
JWT_SECRET=parking_secret_2026
JWT_EXPIRES_IN=24h
```

**`vehiculos/.env`:**
```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USUARIO=postgres
DB_CONTRASENA=admin123
DB_NOMBRE=gestion_vehiculos
JWT_SECRET=parking_secret_2026
```

**`tickets-service/.env`:**
```env
PORT=3004
DB_HOST=localhost
DB_PORT=5432
DB_USUARIO=postgres
DB_CONTRASENA=admin123
DB_NOMBRE=db_tickets
PERSONAS_SERVICE_URL=http://localhost:3001
VEHICULOS_SERVICE_URL=http://localhost:3002
ZONAS_SERVICE_URL=http://localhost:3003
JWT_SECRET=parking_secret_2026
```

**`asignaciones-service/.env`:**
```env
PORT=3005
DB_HOST=localhost
DB_PORT=5432
DB_USUARIO=postgres
DB_CONTRASENA=admin123
DB_NOMBRE=db_asignaciones
PERSONAS_SERVICE_URL=http://localhost:3001
VEHICULOS_SERVICE_URL=http://localhost:3002
JWT_SECRET=parking_secret_2026
```

> El `JWT_SECRET` debe ser **el mismo valor** en todos los servicios. Así cada servicio puede validar tokens generados por personas-service de forma independiente.

### 4.3 Configurar zonas (Spring Boot)

`zonas` usa `zonas/src/main/resources/application.yaml` (ya incluido en el repo):

```yaml
server:
  port: 3003
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/zonas_db
    username: postgres
    password: admin123
```

### 4.4 Instalar dependencias Node.js

```bash
cd backend-personas && npm install && cd ..
cd vehiculos && npm install && cd ..
cd tickets-service && npm install && cd ..
cd asignaciones-service && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## 5. Levantar el sistema completo

Necesitas **6 terminales** abiertas (una por servicio).

**Terminal 1 — personas (con JWT):**
```bash
cd backend-personas
npm run start:dev
```
Espera: `Nest application successfully started`

**Terminal 2 — vehiculos:**
```bash
cd vehiculos
npm run start:dev
```

**Terminal 3 — zonas (Spring Boot):**

Linux/Mac:
```bash
cd zonas && ./gradlew bootRun
```
Windows:
```cmd
cd zonas
gradlew.bat bootRun
```
Espera: `Started ZonasApplication`

**Terminal 4 — tickets-service:**
```bash
cd tickets-service
npm run start:dev
```

**Terminal 5 — asignaciones-service:**
```bash
cd asignaciones-service
npm run start:dev
```

**Terminal 6 — Kong (requiere Docker Desktop abierto):**

Si ya existe el contenedor:
```bash
docker start kong-parking
```

Si es la primera vez (Windows PowerShell):
```powershell
docker run -d --name kong-parking --add-host=host.docker.internal:host-gateway -v "${PWD}/kong/kong.yml:/kong/declarative/kong.yml" -e "KONG_DATABASE=off" -e "KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yml" -e "KONG_ADMIN_LISTEN=0.0.0.0:8001" -p 8000:8000 -p 8001:8001 kong:latest
```

**Terminal 7 — Frontend:**
```bash
cd frontend
npm run dev
```

Abre el navegador en **http://localhost:5173**

---

## 6. Autenticación JWT

El sistema implementa JWT con validación independiente en cada microservicio (Opción A).

### 6.1 Obtener token

```bash
POST http://localhost:3001/auth/login
Content-Type: application/json

{"username": "aparking", "password": "admin123"}
```

Respuesta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "...",
    "username": "aparking",
    "roles": ["INVITADO"]
  }
}
```

### 6.2 Usar el token

Incluye el token en el header de cada petición protegida:
```
Authorization: Bearer <access_token>
```

### 6.3 Rutas públicas (sin token — rol invitado)

| Ruta | Descripción |
|------|-------------|
| `POST /auth/login` | Iniciar sesión |
| `POST /personas` | Registrar persona |
| `GET /personas/cedula/:c` | Buscar por cédula |
| `GET /personas/:id` | Buscar por ID |
| `GET /vehiculos` | Listar vehículos |
| `GET /vehiculos/placa/:p` | Buscar por placa |
| `GET /vehiculos/:id` | Buscar por ID |
| `POST /tickets/entrada` | Registrar entrada al parqueadero |
| `PATCH /tickets/salida/:id` | Procesar salida |
| `GET /tickets/:id` | Ver detalle de ticket |
| `GET /asignaciones/propietario/:id` | Consultar flota propia |

### 6.4 Rutas protegidas (requieren Bearer token)

| Ruta | Descripción |
|------|-------------|
| `GET /personas` | Lista completa de personas |
| `POST /vehiculos` | Registrar vehículo |
| `PATCH/DELETE /vehiculos/:id` | Modificar/eliminar vehículo |
| `GET /tickets/activos` | Dashboard de tickets activos |
| `POST /asignaciones` | Asignar vehículo a propietario |
| `GET /asignaciones/trazabilidad` | Auditoría completa |
| `PATCH/DELETE /asignaciones` | Modificar/eliminar asignación |
| `GET/POST /roles` | Gestión de roles |

---

## 7. Microservicio de Asignación y Trazabilidad

Cumple los 3 requisitos funcionales de la evaluación:

### RF1 — Clave compuesta
La entidad `AsignacionVehiculo` usa `(user_id, vehicle_id)` como clave primaria compuesta con `@PrimaryColumn`.

```
POST /asignaciones
Body: { "userId": "...", "vehicleId": "..." }
```

### RF2 — Auditoría automática por Domain Events
Al crear, modificar o eliminar una asignación, el servicio emite un evento desacoplado. El `TrazabilidadListener` lo captura y guarda el registro automáticamente sin que el servicio lo llame directamente.

```
GET /asignaciones/trazabilidad               → historial completo
GET /asignaciones/{userId}/{vehicleId}/trazabilidad → historial específico
```

Cada registro incluye: `tipoAccion` (CREACION/MODIFICACION/ELIMINACION), `timestamp`, `datosAnteriores`, `datosNuevos`.

### RF3 — Consulta de flota por propietario
Retorna todos los vehículos asignados a un propietario, enriquecidos con datos del propietario (via personas-service) y tipo inferido de cada vehículo.

```
GET /asignaciones/propietario/{userId}
```

---

## 8. Verificar que todo funciona

| Servicio | URL de verificación |
|---|---|
| personas (público) | http://localhost:3001/personas/cedula/9999999999 |
| vehiculos (público) | http://localhost:3002/vehiculos |
| zonas | http://localhost:3003/zonas |
| tickets | http://localhost:3004/tickets/activos *(requiere token)* |
| asignaciones | http://localhost:3005/asignaciones/trazabilidad *(requiere token)* |

### Swagger (documentación interactiva)

| Servicio | URL de Swagger |
|---|---|
| personas | http://localhost:3001/api/docs |
| vehiculos | http://localhost:3002/api/docs |
| zonas | http://localhost:3003/swagger-ui.html |
| tickets-service | http://localhost:3004/api/docs |
| asignaciones | http://localhost:3005/api/docs |

### Kong

```bash
curl http://localhost:8000/api/personas/cedula/9999999999
```

---

## 9. Flujo de prueba completo

1. **Registrar persona:** `POST /personas` con `{ firstName, lastName, dni, email, password }`
2. **Login:** `POST /auth/login` → guardar el `access_token`
3. **Registrar vehículo** (con token): `POST /vehiculos`
4. **Asignar vehículo a propietario** (con token): `POST /asignaciones`
5. **Consultar flota** (sin token): `GET /asignaciones/propietario/{userId}`
6. **Crear zona y espacios:** via Swagger de zonas
7. **Ticket de entrada** (sin token): `POST /tickets/entrada` con `{ cedula, placa, zonaId }`
8. **Ticket de salida** (sin token): `PATCH /tickets/salida/{ticketId}`
9. **Ver trazabilidad** (con token): `GET /asignaciones/trazabilidad`

---

## 10. Problemas comunes

### "Token no proporcionado" (401)
Falta el header `Authorization: Bearer <token>`. Obtén un token con `POST /auth/login` primero.

### "ECONNREFUSED" al arrancar
El contenedor de PostgreSQL no está corriendo. Ejecuta: `docker start finanzas_postgres`

### "EADDRINUSE: address already in use"
Algún servicio quedó corriendo. Libera el puerto:

**Windows:**
```cmd
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -i :3001 | kill -9 $(lsof -ti:3001)
```

### Kong: contenedor ya existe
```bash
docker start kong-parking
```

### Spring Boot (zonas) no compila
Este proyecto requiere Java 25. Verifica con `java -version`. Si tienes otra versión instalada, ajusta `javaVersion` en `zonas/build.gradle`.

---

## 11. Apagar el sistema

```bash
# Detener servicios Node (Ctrl+C en cada terminal)

# Detener contenedores Docker:
docker stop finanzas_postgres
docker stop kong-parking
```
