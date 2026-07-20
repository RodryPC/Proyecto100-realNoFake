# Ejecución Local

Guía paso a paso para ejecutar el proyecto en tu máquina local después de clonarlo.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **pnpm** (gestor de paquetes)
- **Docker** y **Docker Compose** (para PostgreSQL)

## Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Proyecto100-realNoFake
```

## Paso 2: Configurar Variables de Entorno

El archivo `.env` no se incluye en el repositorio por seguridad. Crea uno nuevo en la raíz del proyecto con el siguiente contenido:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/gastos_db"
AUTH_SECRET="pon-un-secreto-seguro-aqui"
AUTH_URL="http://localhost:3000"
```

**Nota:** Puedes cambiar el `AUTH_SECRET` por cualquier string aleatorio seguro.

## Paso 3: Levantar PostgreSQL con Docker

Ejecuta el siguiente comando para iniciar la base de datos PostgreSQL en segundo plano:

```bash
docker compose up -d
```

Esto creará un contenedor con:
- Usuario: `user`
- Contraseña: `pass`
- Base de datos: `gastos_db`
- Puerto: `5432`

## Paso 4: Instalar Dependencias

Instala todas las dependencias del proyecto:

```bash
pnpm install
```

Este comando también ejecuta automáticamente `prisma generate` (configurado en el script `postinstall`).

## Paso 5: Sincronizar Base de Datos

Crea las tablas en PostgreSQL según el schema de Prisma:

```bash
pnpm db:push
```

## Paso 6: Iniciar Servidor de Desarrollo

Inicia el servidor de Next.js:

```bash
pnpm dev
```

El servidor se iniciará en `http://localhost:3000`.

## Paso 7: Abrir en el Navegador

Abre tu navegador y ve a:

```
http://localhost:3000
```

Desde allí podrás:
- Registrarte con email y contraseña
- Iniciar sesión
- Crear grupos de gastos
- Agregar gastos y ver cómo se dividen

## Comandos Útiles Adicionales

- **Ver logs de la base de datos:** `docker compose logs -f db`
- **Detener la base de datos:** `docker compose down`
- **Abrir Prisma Studio (explorador visual de la DB):** `pnpm db:studio`
- **Regenerar cliente Prisma:** `pnpm db:generate`

## Solución de Problemas

**Error: "Port 5432 already in use"**
- Ya tienes PostgreSQL corriendo en tu máquina. Detén el servicio local o cambia el puerto en `docker-compose.yml`.

**Error: "Cannot connect to database"**
- Verifica que Docker esté corriendo: `docker ps`
- Asegúrate de que el contenedor esté activo: `docker compose ps`
- Verifica que las credenciales en `.env` coincidan con las de `docker-compose.yml`.

**Error: "AUTH_SECRET is not set"**
- Asegúrate de haber creado el archivo `.env` con todas las variables necesarias.
