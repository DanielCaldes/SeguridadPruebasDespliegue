
# PairUp App

Este proyecto tiene como objetivo automatizar el proceso de despliegue de una aplicación **Node.js** utilizando **Docker**, **GitHub Actions** y **DigitalOcean**. La aplicación se conecta a una base de datos **MongoDB** y ejecuta pruebas automatizadas antes de cada despliegue.
La aplicación desarrollada para el despliegue se centra en conectar personas mostrando sus perfiles mediante un sistema sencillo de interacción tipo "like/dislike" estilo Tinder.

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


## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
