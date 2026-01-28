# Chilsmart Commerce Core

API backend para el sistema de comercio electrónico Chilsmart, construido con Node.js, Express y PostgreSQL.

## 📋 Requisitos Previos

- **Node.js** (v14 o superior)
- **PostgreSQL** (v12 o superior)
- **npm** o **yarn**

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd chilsmart-commerce-core
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DB_HOST=localhost
DB_NAME=chilsmart_commerce
DB_USER=postgres
DB_PASS=tu_password

# JWT
JWT_SECRET=tu-secret-key-super-segura-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# Servidor
PORT=3000
NODE_ENV=development
```

**⚠️ Importante:** Cambia `JWT_SECRET` por una clave segura y única en producción.

### 4. Configurar base de datos

#### Probar conexión a la base de datos

Antes de continuar, prueba la conexión:

```bash
npm run test:db
```

Este script te ayudará a identificar problemas de conexión y te dará sugerencias.

#### Si no recuerdas tu contraseña de PostgreSQL

**Opción 1: Probar sin contraseña (más común en Windows)**

En tu archivo `.env`, deja `DB_PASS` vacío:

```env
DB_PASS=
```

**Opción 2: Resetear la contraseña de PostgreSQL**

1. **En Windows:**
   - Abre el archivo `pg_hba.conf` (normalmente en `C:\Program Files\PostgreSQL\[versión]\data\pg_hba.conf`)
   - Busca la línea que dice `host all all 127.0.0.1/32 md5` o `host all all 127.0.0.1/32 scram-sha-256`
   - Cámbiala temporalmente a `host all all 127.0.0.1/32 trust`
   - Reinicia el servicio de PostgreSQL
   - Conéctate sin contraseña: `psql -U postgres`
   - Cambia la contraseña: `ALTER USER postgres WITH PASSWORD 'nueva_contraseña';`
   - Vuelve a cambiar `pg_hba.conf` a `md5` o `scram-sha-256`
   - Reinicia PostgreSQL nuevamente

2. **Alternativa rápida (solo desarrollo local):**
   - Edita `pg_hba.conf` y cambia todas las líneas de `md5`/`scram-sha-256` a `trust` para localhost
   - Esto permite conexiones sin contraseña (solo para desarrollo)

#### Crear la base de datos

```bash
# Conectarse a PostgreSQL (sin contraseña si usas trust)
psql -U postgres

# O con contraseña
psql -U postgres -h localhost

# Crear la base de datos
CREATE DATABASE chilsmart_commerce;

# Salir
\q
```

#### Ejecutar migraciones (si las tienes)

```bash
npx sequelize-cli db:migrate
```

#### Opción B: Crear tablas manualmente

Ejecuta los scripts SQL de creación de tablas en tu base de datos PostgreSQL.

### 5. Iniciar el servidor

```bash
node server.js
```

O en modo desarrollo con nodemon (si lo tienes instalado):

```bash
npm install -g nodemon
nodemon server.js
```

El servidor estará corriendo en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
chilsmart-commerce-core/
├── src/
│   ├── config/          # Configuración de base de datos
│   ├── controllers/     # Controladores de la API
│   ├── middleware/      # Middlewares (autenticación, etc.)
│   ├── models/          # Modelos de Sequelize
│   ├── routes/          # Rutas de la API
│   ├── utils/           # Utilidades (JWT, etc.)
│   ├── validators/      # Validadores de entrada
│   └── app.js           # Configuración de Express
├── migrations/          # Migraciones de base de datos
├── seeders/            # Seeders de base de datos
├── config/             # Configuración de Sequelize CLI
├── server.js           # Punto de entrada del servidor
└── package.json        # Dependencias del proyecto
```

## 🔐 Autenticación

### Registro de Usuario

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "company_id": 1,
  "role": "admin"  // Opcional, por defecto es "admin"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "admin",
      "company_id": 1,
      "Company": {
        "id": 1,
        "name": "Mi Empresa",
        "plan": "basic"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Inicio de Sesión

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Obtener Perfil (Protegido)

```bash
GET /api/auth/profile
Authorization: Bearer <token>
```

### Actualizar Perfil (Protegido)

```bash
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Juan Carlos Pérez",
  "email": "juancarlos@example.com"
}
```

### Cambiar Contraseña (Protegido)

```bash
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

### Verificar Token

```bash
GET /api/auth/verify
Authorization: Bearer <token>
```

## 🛡️ Proteger Rutas

Para proteger una ruta, usa el middleware `authenticate`:

```javascript
const { authenticate } = require('./middleware/auth');

router.get('/ruta-protegida', authenticate, (req, res) => {
  // req.user contiene la información del usuario autenticado
  res.json({ user: req.user });
});
```

Para autorizar por roles:

```javascript
const { authenticate, authorize } = require('./middleware/auth');

router.delete('/admin-only', 
  authenticate, 
  authorize('admin', 'superadmin'), 
  (req, res) => {
    // Solo usuarios con rol 'admin' o 'superadmin' pueden acceder
  }
);
```

## 📊 Modelos de Base de Datos

El proyecto incluye los siguientes modelos:

- **Company** - Empresas
- **User** - Usuarios del sistema
- **Store** - Tiendas
- **Category** - Categorías de productos
- **Product** - Productos
- **Customer** - Clientes
- **Order** - Órdenes
- **OrderItem** - Items de órdenes
- **Payment** - Pagos
- **Shipment** - Envíos
- **AnalyticsEvent** - Eventos de analytics

## 🔧 Scripts Disponibles

```bash
# Iniciar servidor
node server.js

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Revertir última migración
npx sequelize-cli db:migrate:undo

# Crear migración
npx sequelize-cli migration:generate --name nombre-migracion

# Ejecutar seeders
npx sequelize-cli db:seed:all
```

## 🧪 Testing

Para verificar que el servidor está funcionando:

```bash
GET http://localhost:3000/api/health
```

Deberías recibir:
```json
{
  "success": true,
  "message": "API funcionando correctamente"
}
```

## 🔒 Seguridad

- Las contraseñas se hashean automáticamente con bcrypt (10 salt rounds)
- Los tokens JWT tienen expiración configurable
- Validación de datos de entrada en todas las rutas
- Middleware de autenticación para proteger rutas sensibles
- Autorización por roles

## 📝 Notas Importantes

1. **Cambiar JWT_SECRET en producción:** Usa una clave segura y única
2. **Variables de entorno:** Nunca commitees el archivo `.env`
3. **Base de datos:** Asegúrate de tener PostgreSQL corriendo antes de iniciar el servidor
4. **Migraciones:** En producción, usa migraciones en lugar de `sync()`

## 🐛 Solución de Problemas

### Error de conexión a la base de datos

**Probar conexión:**
```bash
npm run test:db
```

**Problemas comunes:**

1. **"client password must be a string"**
   - Asegúrate de que `DB_PASS` en `.env` sea un string vacío `DB_PASS=` o una contraseña válida
   - No uses `null` o valores undefined

2. **"password authentication failed"**
   - La contraseña es incorrecta
   - Prueba dejando `DB_PASS=` vacío
   - O resetea la contraseña (ver sección anterior)

3. **"database does not exist"**
   - Crea la base de datos: `CREATE DATABASE chilsmart_commerce;`

4. **"connection refused"**
   - Verifica que PostgreSQL esté corriendo
   - En Windows: Servicios → PostgreSQL → Iniciar
   - Verifica que `DB_HOST` sea correcto (normalmente `localhost`)

### Error de autenticación
- Verifica que `JWT_SECRET` esté configurado
- Revisa que el token esté siendo enviado correctamente en el header `Authorization`

### Error de migraciones
- Asegúrate de tener `sequelize-cli` instalado globalmente o en el proyecto
- Verifica la configuración en `config/config.json`

## 📄 Licencia

ISC

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte, abre un issue en el repositorio.

