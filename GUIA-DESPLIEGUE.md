# Guía de Despliegue — Next.js Full-Stack (Vercel + Neon)

Guía reutilizable para desplegar una aplicación Next.js (App Router) full-stack
con Prisma + PostgreSQL en infraestructura gratuita. El objetivo es simular el
flujo de producción real: app en un servidor externo, base de datos en otro
proveedor, conectados por variable de entorno.

Stack cubierto por esta guía:
- Next.js 15 (App Router) + React 19 + TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- NextAuth (auth)

---

## Topología resultante

```
[ GitHub repo ]
      │ git push
      ▼
[ Vercel ]  ── DATABASE_URL ──►  [ Neon Postgres ]
 (Next.js build + start)         (base de datos externa)
      │
      ▼
 URL pública https://<proyecto>.vercel.app
```

La base de datos es un proveedor distinto a la app, igual que en producción real.
Las credenciales NUNCA van en el repo: viven como Environment Variables en Vercel.

---

## Paso 1 — Base de datos en Neon

1. Ir a https://neon.tech y crear cuenta (puede usarse GitHub).
2. **New Project** → nombre, región cercana, versión de Postgres por defecto.
3. Al crear, copiar la **Connection string** (DATABASE_URL). Tiene forma:
   `postgresql://<user>:<pass>@<host>/<db>?sslmode=require`
4. La base de datos ya existe en este punto. No se sube nada aún.

Si se rota el password en Neon, se genera una DATABASE_URL nueva. Las tablas
ya creadas no se pierden: rotar solo cambia la llave de acceso, no los datos.

---

## Paso 2 — Crear las tablas con Prisma

Desde la terminal local (o Codespaces), con la DATABASE_URL de Neon:

```bash
DATABASE_URL="<pega-aquí-la-URL-de-Neon>" npx prisma db push
```

Esto conecta a Neon y crea las tablas definidas en `prisma/schema.prisma`.
El schema debe leer la URL desde env, no hardcodeada:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Paso 3 — Desplegar en Vercel

1. Ir a https://vercel.com y crear cuenta (puede usarse GitHub).
2. **Add New → Project → Import Git Repository**.
3. Seleccionar el repositorio de GitHub.
   Vercel detecta Next.js automáticamente (Framework Preset = Next.js).
   No modificar Build/Install commands.
4. Antes de hacer Deploy, agregar **Environment Variables**:

   | Key            | Value                                              |
   |----------------|----------------------------------------------------|
   | `DATABASE_URL` | URL de Neon del Paso 1                             |
   | `AUTH_SECRET`  | generar con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
   | `NEXTAUTH_URL` | URL de Vercel tras el primer deploy (ver Paso 4)   |

   Cualquier otra variable que exista en el `.env` local (excepto las de
   Docker/local) también se agrega aquí.

5. Click **Deploy**. Vercel ejecuta: install → prisma generate (postinstall)
   → next build → deploy. Tarda ~1-2 min.

---

## Paso 4 — Completar NEXTAUTH_URL y redeploy

1. Tras el deploy, Vercel muestra la URL (ej. `https://mi-proyecto.vercel.app`).
2. Ir a **Settings → Environment Variables** y agregar:
   `NEXTAUTH_URL=https://mi-proyecto.vercel.app`
3. **Save** y luego **Deployments → Redeploy** (o hacer un nuevo `git push`).

Esto es necesario para que NextAuth funcione en el dominio de producción
(login, callbacks de sesión).

---

## Paso 5 — Verificación

- Abrir la URL de Vercel.
- Registrar un usuario y loguearse.
- Si el login falla: revisar que `AUTH_SECRET` y `NEXTAUTH_URL` estén presentes
  y sean correctos, luego redeploy.

---

## Notas de arquitectura

- **Monolito full-stack**: Frontend y Backend viven en el mismo código Next.js.
  Se despliega como una sola unidad; no se sube "el backend" por separado.
- **Env vars vs código**: el código es agnóstico de infra. La configuración
  (DATABASE_URL, secrets) vive en el entorno, no en el repositorio.
- **Vercel free**: la app responde siempre (no "duerme" como otros free tiers),
  pero tiene límites de ancho de banda y builds. Neon free tiene límite de
  almacenamiento y la BD se pausa tras inactividad (se reanuda sola al usarla).
- **Cambio de versión de Next.js**: si se fija la versión en package.json,
  Vercel usa esa. Actualizar la versión requiere commit + push para redeploy.

---

## Comandos rápidos

```bash
# Crear tablas en Neon
DATABASE_URL="<neon>" npx prisma db push

# Generar AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Redeploy manual desde CLI (opcional)
vercel --prod
```

---

## Checklist pre-despliegue

- [ ] Repositorio en GitHub
- [ ] `prisma/schema.prisma` usa `env("DATABASE_URL")`
- [ ] Tablas creadas en Neon (`prisma db push`)
- [ ] `DATABASE_URL` de Neon en env vars de Vercel
- [ ] `AUTH_SECRET` generado y en env vars de Vercel
- [ ] `NEXTAUTH_URL` apuntando a la URL de Vercel
- [ ] No hay `page.tsx` duplicadas que resuelvan a la misma ruta
