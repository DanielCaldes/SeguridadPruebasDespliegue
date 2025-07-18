
# PairUp App

Este proyecto tiene como objetivo automatizar el proceso de despliegue de una aplicación **Node.js** utilizando **Docker**, **GitHub Actions** y **DigitalOcean**. La aplicación se conecta a una base de datos **MongoDB** y ejecuta pruebas automatizadas antes de cada despliegue.

La aplicación desarrollada para el despliegue se centra en conectar personas mostrando sus perfiles mediante un sistema sencillo de interacción tipo "like/dislike" estilo Tinder.

Despliegue temporal en DigitalOcean. Si no está disponible, descarga el proyecto y ejecútalo localmente.
```url
  http://165.227.229.142:3000/api/
```

## Características
- **Funcionalidades de la API**:
  - **Auth**: Permite registrar nuevos usuarios e iniciar sesión en la aplicación.
  - **Users**: Permite obtener, actualizar y eliminar datos de usuarios existentes.
  - **Interaction**: Permite buscar otros usuarios, reaccionar(like y dislike), consultar matches(cuando hay like entre dos personas) y borrar matches.

- **Despliegue automático**: Utiliza GitHub Actions para construir y desplegar la imagen Docker en DigitalOcean tras cada push a la rama main.

- **Pruebas automatizadas**: Ejecuta pruebas unitarias con **Jest** y de integración son **Supertest** antes de la construcción de la imagen para asegurar el correcto funcionamiento de la aplicación.

- **Seguridad**:
  - En almacenamiento de constraseñas hasheadas mediante **bcrypt**.
  - Autenticación basada en **JWT(JSON Web Tokens)**
  - Validación y santitación de las entradas de datos con **Joi** y **sanitize-html**
  - Se utiliza una clave SSH para acceder al servidor de DigitalOcean.  
  - Se ha restringido el acceso público al puerto de MongoDB.  
  - La base de datos se vincula internamente al contenedor de la aplicación.

## Requisitos
- Cuenta en DigitalOcean  
- Cuenta en GitHub  
- Docker  
- Docker Compose  
- Node.js  
- MongoDB  

## Instalación

1. Clona este repositorio:

   ```bash
   git clone https://github.com/DanielCaldes/SeguridadPruebasDespliegue.git
   cd SeguridadPruebasDespliegue
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` a partir del ejemplo proporcionado:

   ```bash
   cp .env.example .env
   ```
4. Para conectar la aplicación a MongoDB, será necesario tener una imagen de MongoDB ejecutándose en Docker o conectarse a una instancia externa como MongoDB Atlas.
   ```bash
   docker pull mongo:6
   ```

## Ejecución

1. Asegúrate de tener MongoDB activo, ya sea en un contenedor Docker o mediante Mongo Atlas.

2. Inicia la aplicación localmente con el siguiente comando:

   ```bash
   node .
   ```

3. Accede a la aplicación desde tu navegador o desde otras herramientas como RapidAPI:

   ```
   http://localhost:3000
   ```

4. Para ejecutar las pruebas automatizadas, usa:

   ```bash
   npm test
   ```

## Despliegue

El despliegue se realiza automáticamente mediante GitHub Actions cada vez que se hace un push a la rama main. El flujo de trabajo incluye:

- Instalación de dependencias.  
- Ejecución de pruebas automatizadas.  
- Construcción de la imagen Docker.  
- Despliegue de la imagen en DigitalOcean.

Esta configurado en el archivo ``ci-cd.yml``

## Endpoints

### Autentificación
#### 1. Registrar un usuario

- **Método**: POST
  ```url
  /api/auth/register
  ```
- **Descripción**: Crea un nuevo usuario y lo agrega a la base de datos.
- **Cuerpo de la solicitud** (JSON):
  ```json
  {
    "name": "myName",
    "email": "myEmail@example.com",
    "password": "myPassword"
  }
  ```
- **Respuesta**:
  ```json
  {
    "message": "Usuario registrado correctamente"
  }
  ```
  
#### 2. Iniciar sesión con un usuario
  - **Método**: POST
  ```url
  /api/auth/login
  ```
- **Descripción**: Autentica un usuario devolviendo el token de acceso.
- **Cuerpo de la solicitud** (JSON):
  ```json
  {
    "email": "myEmail@example.com",
    "password": "myPassword"
  }
  ```
- **Respuesta**:
  ```json
  {
    "id": "userId",
    "token":"myToken"
  }
  ```

### Usuarios (Requiere token de login en el encabezado Authorization con esquema Bearer)
#### 1. Obtener información de un usuario

- **Método**: GET
  ```url
  /api/users/:id
  ```
- **Descripción**: Obtiene la información de un usuario por id.
- **Respuesta**:
  ```json
  {
    "_id": "userId",
    "name": "myName",
    "description": "",
    "gender": "",
    "age": null,
    "location": ""
  }
  ```
#### 2. Cambiar información de un usuario
  - **Método**: PUT
  ```url
  /api/users/:id
  ```
- **Descripción**: Cambia la información de un usuario.
- **Cuerpo de la solicitud** (JSON): (Todos son opcionales, mínimo pasar uno)
  ```json
  {
    "name": "newName",
    "description": "newDescription",
    "gender": "male",
    "age": 21,
    "location": "Spain"
  }
  ```
- **Respuesta**: (Información actualizada del usuario)
  ```json
  {
    "_id": "userId",
    "name": "newName",
    "description": "newDescription",
    "gender": "male",
    "age": 21,
    "location": "Spain"
  }
  ```
#### 3. Borrar un usuario
  - **Método**: DELETE
  ```url
  /api/users/:id
  ```
- **Descripción**: Borra a un usuario si coincide con el token de autenticación.
- **Respuesta**:
  ```json
  {
    "message" : "Usuario borrado <id>"
  }
  ```

### Interacción (Requiere token de login en el encabezado Authorization con esquema Bearer)
#### 1. Buscar usuarios

- **Método**: GET
  ```url
  /api/search
  ```
- **Descripción**: Obtiene una lista de usuarios a los que no se haya reaccionado previamente.
- **Respuesta**:
  ```json
  [{
    "_id": "userId",
    "name": "otherName",
    "description": "",
    "gender": "",
    "age": null,
    "location": ""
  }]
  ```

#### 2. Reaccionar a un usuario
  - **Método**: POST
  ```url
  /api/swipe/:targetId
  ```
- **Descripción**: Permite reaccionar a un usuario con like(true) o dislike(false).
- **Cuerpo de la solicitud** (JSON):
  ```json
  {
    "liked": true
  }
  ```
- **Respuesta**:
  ```json
  {
    "message": "Like registrado"
  }
  ```

#### 3. Ver matches
  - **Método**: GET
  ```url
  /api/matches
  ```
- **Descripción**: Devuelve una lista con los usuarios con los que ha tenido un match.
- **Respuesta**:
  ```json
  [{
    "_id": "userId",
    "name": "otherName",
    "description": "",
    "gender": "",
    "age": null,
    "location": ""
  }]
  ```
  
#### 4. Borrar un match
  - **Método**: DELETE
  ```url
  /api/matches/:targetId
  ```
- **Descripción**: Permite borrar un match con un usuario.
- **Respuesta**:
  ```json
  {
    "message": "Match eliminado"
  }
  ```
## Estructura del proyecto
```
SeguridadPruebasDespliegue/
├── .github/
│   └── workflows/
│       └── ci-cd.yml               # Configuración de CI/CD con GitHub Actions
├── src/
│   ├── controllers/                # Lógica de negocio por entidad
│   │   ├── auth.controller.js              # Controlador de autenticación
│   │   ├── auth.controller.test.js        # Pruebas unitarias de autenticación
│   │   ├── interactions.controller.js     # Controlador de interacciones
│   │   ├── interactions.controller.test.js# Pruebas de interacciones
│   │   ├── users.controller.js            # Controlador de usuarios
│   │   └── users.controller.test.js       # Pruebas de usuarios
│   ├── database/
│   │   └── database.js             # Configuración y conexión de Mongoose
│   ├── middlewares/               # Middlewares personalizados
│   │   ├── authJWT.middleware.js            # Verificación de JWT
│   │   ├── authJWT.middleware.test.js       # Test de middleware JWT
│   │   ├── rateLimit.middleware.js          # Limitador de peticiones
│   │   ├── rateLimit.middleware.test.js     # Test de rate limiting
│   │   ├── sanitizeHTML.middleware.js       # Sanitización de HTML
│   │   ├── sanitizeHTML.middleware.test.js  # Test de sanitización
│   │   └── validateJoi.middleware.js        # Validación con Joi
│   ├── models/
│   │   └── user.model.js           # Esquema de usuario con Mongoose
│   ├── routes/                     # Definición de rutas del servidor
│   │   ├── auth.routes.js                   # Rutas de autenticación
│   │   ├── interactions.router.js          # Rutas de interacciones
│   │   └── users.router.js                 # Rutas de usuarios
│   ├── test/                       # Pruebas de integración/end-to-end
│   │   ├── auth.test.js
│   │   ├── interactions.test.js
│   │   └── users.test.js
│   └── validations/               # Esquemas de validación con Joi
│       ├── auth.validation.js
│       ├── interactions.validation.js
│       └── users.validation.js
├── .dockerignore                  # Exclusiones para contextos Docker
├── .env                           # Variables de entorno (local)
├── .env.example                   # Ejemplo base de variables de entorno
├── app.js                         # Configuración de la aplicación Express
├── docker-compose.yml            # Orquestación de contenedores
├── Dockerfile                    # Imagen Docker del backend
├── index.js                      # Punto de entrada de la app
├── package.json                  # Dependencias y scripts del proyecto
└── package-lock.json             # Versión exacta de dependencias
```
## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
