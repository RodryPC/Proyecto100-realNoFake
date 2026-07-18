# ARQUITECTURA.md — Cómo funciona este proyecto a alto nivel

> Propósito de este archivo: entender **cómo funciona un sistema full stack** usando
> este proyecto como ejemplo concreto. NO explica el código, ni los componentes, ni la
> sintaxis. Explica la *lógica* y el *flujo de información* entre las partes.
>
> Si querés aprender "cómo funciona un sistema", este es el lugar. Si querés aprender
> cómo funciona una función o un framework en particular, este archivo no es para eso.

---

## 1. ¿De qué trata este proyecto?

Es una aplicación para **dividir gastos compartidos**. La idea real (el "problema de
negocio") es simple:

- Varios usuarios se juntan en un grupo (ej: roommates, un viaje, un equipo).
- Cada uno va pagando cosas (alguacil, mercado, una cena).
- La app registra quién pagó, cuánto, y para quién fue el gasto.
- Al final podés ver **quién le debe a quién** y cerrar las cuentas.

Eso es todo. Todo lo demás (pantallas, botones, base de datos, Docker) existe para
que esa idea funcione en una computadora y la puedan usar varias personas a la vez.

---

## 2. Las tres piezas de cualquier sistema full stack

Cualquier app que varias personas usan por internet, por más simple que sea, se apoya
en tres responsabilidades distintas. Pensalas como tres "empleados" con trabajos
diferentes:

### El Frontend (la "vitrina")
Es lo que el usuario ve y toca: pantallas, botones, formularios, listas. Su único
trabajo es **mostrar información** y **capturar lo que el usuario quiere hacer**
("quiero crear un gasto de $50"). No decide reglas de negocio, solo habla con el back.

En este proyecto, el frontend es **Next.js + React**. Pero lo importante no es el
nombre: es que su rol es *la cara visible*.

### El Backend (la "oficina")
Es donde se aplican las reglas. Cuando el frontend dice "creá un gasto", el backend
decide: ¿el usuario tiene permiso? ¿los datos son válidos? ¿cómo se guarda? ¿cómo se
calcula quién le debe a quién? El backend es el cerebro que nadie ve.

En este proyecto, el backend son los **Route Handlers** de Next.js (las rutas bajo
`/api`). O sea: el front y el back viven en el mismo programa. Eso se llama
**monolito**, y es lo normal en proyectos pequeños: no hay dos servidores separados,
pero las responsabilidades sí están separadas en la cabeza.

### La Base de Datos (la "bóveda")
Es donde se guarda la información para que no se pierda cuando apagás la compu. Aquí
viven los usuarios, los grupos y los gastos. La base de datos no piensa: solo guarda,
busca, actualiza y borra datos siguiendo instrucciones.

En este proyecto, la base de datos es **PostgreSQL**.

```
   USUARIO
      │  (ve y toca)
      ▼
 ┌─────────────┐        pide/recibe datos         ┌─────────────┐
 │  FRONTEND   │ ───────────────────────────────▶ │   BACKEND   │
 │ (Next.js)   │                                   │  (/api)     │
 └─────────────┘ ◀─────────────────────────────── └──────┬──────┘
      ▲                       muestra resultado            │ guarda/lee
      │                                                    ▼
      │                                            ┌─────────────┐
      │                                            │ BASE DATOS  │
      │                                            │ (PostgreSQL)│
      └────────────────────────────────────────────└─────────────┘
```

---

## 3. Cómo se comunican (el "contrato")

El frontend y el backend no comparten memoria ni variables. Se hablan por **HTTP**,
que es el idioma de la web: el frontend manda un "pedido" (request) y recibe una
"respuesta" (response), casi siempre en formato JSON (texto estructurado).

Ejemplo mental: el frontend no dice `crearGasto()`. Dice: *"¡Backend! Recibí este
pedido por HTTP: método POST a `/api/groups/123/expenses`, con estos datos"*. El
backend lo procesa y responde: *"Listo, gasto creado, acá tenés el ID"*.

El backend y la base de datos se comunican de otra forma: el backend le pide datos
usando un cliente (en este proyecto, **Prisma**) que traduce "quiero los gastos del
grupo 123" a un lenguaje que PostgreSQL entiende, y trae los resultados de vuelta.

**Clave para aprender:** en un sistema, cada capa solo conoce a la siguiente. El
frontend no sabe cómo está hecha la base de datos; la base de datos no sabe qué
pantalla mostró el usuario. Eso se llama *separación de responsabilidades* y es la
razón por la que podés cambiar el frontend sin tocar la base de datos.

---

## 4. Las herramientas como "ayudantes" (no protagonistas)

Acá aclaramos el papel de cada herramienta. Ninguna es "la lógica"; todas hacen
posible que la lógica funcione.

- **Docker**: es una forma de empaquetar y correr programas aislados. En este
  proyecto, Docker **solo levanta la base de datos** (PostgreSQL) en un contenedor.
  La app en sí corre afuera. Docker no sabe nada de gastos; solo se encarga de que
  la base de datos esté disponible en el puerto 5432 y de que sus datos persistan
  aunque reinicies. Sin Docker podrías instalar PostgreSQL a mano; el sistema
  funcionaría igual.

- **Prisma**: es el "traductor" entre el backend (escrito en TypeScript) y la base
  de datos (PostgreSQL). El backend escribe `prisma.gastos.create(...)` y Prisma se
  encarga de convertirlo al SQL real. Su rol es quitarle al backend la carga de
  hablar SQL a mano.

- **NextAuth**: se encarga de la **sesión / identidad**. Cuando un usuario inicia
  sesión, NextAuth le da una credencial que el backend usa para saber "este pedido
  lo hizo el usuario X". Es el portero que distingue quién es quién.

- **Tailwind / React Hook Form / Zod**: son detalles de *cómo* se construye la
  interfaz y se validan formularios. No afectan la lógica del sistema; son comodidad
  de construcción.

La enseñanza: **las herramientas son medios, no el sistema**. El sistema es
"front que pide → back que decide → base que guarda". Las herramientas solo lo
hacen más fácil o más portable.

---

## 5. Ejemplo paso a paso: "Crear un gasto"

Seguimos una acción real de punta a punta para que se vea el flujo completo.

1. **En el frontend**, el usuario completa el formulario (monto, quién pagó, para
   quién) y presiona "Guardar".
2. El frontend **arma un pedido HTTP** y lo manda al backend: `POST /api/groups/123/expenses`
   con los datos del gasto.
3. El backend **recibe el pedido**. Primero verifica la identidad con NextAuth
   (¿está logueado? ¿es miembro del grupo 123?). Si no, rechaza.
4. El backend **valida los datos** (monto positivo, etc.) y aplica la regla de
   negocio.
5. El backend le pide a **Prisma** que guarde el gasto en **PostgreSQL**.
6. PostgreSQL **guarda la fila** y confirma.
7. Prisma confirma al backend; el backend **responde al frontend** con el gasto creado.
8. El frontend **muestra el gasto** en la lista y el usuario lo ve reflejado.

```
Usuario → Frontend (form) → HTTP POST → Backend (valida + sesión)
        → Prisma → PostgreSQL (guarda) → vuelve → Frontend (muestra)
```

Ese viaje de ida y vuelta es, literalmente, "cómo funciona un sistema".

---

## 6. Cómo arranca todo (el ciclo de vida)

Para que el sistema funcione, alguien tiene que prender las piezas en orden:

1. Se levanta **Docker** → arranca PostgreSQL (la bóveda disponible).
2. El backend necesita saber **dónde está la base de datos**: eso se indica con una
   variable de entorno (`DATABASE_URL`). Es como darle la dirección de la bóveda.
3. Se crea la **estructura de tablas** en la base (Prisma define el esquema y lo
   empuja a PostgreSQL).
4. Se arranca el programa **Next.js** (que contiene front + back) en el puerto 3000.
5. El usuario abre el navegador en `localhost:3000` y empieza a usar la app.

Notá que **Docker y la variable de entorno son infraestructura de soporte**: sin
ellos no arranca, pero no son "la lógica". La lógica es lo que pasa en los pasos 2–8
de la sección anterior.

---

## 7. Mapa de responsabilidades (para ubicarte en el repo)

Sin mostrar código, esto es qué carpeta/cosa cumple qué rol:

- `src/app/` → el frontend (pantallas) y también los endpoints del backend (`/api`).
- `prisma/schema.prisma` → la "definición de la bóveda": qué tablas existen y cómo se
  relacionan (usuarios, grupos, gastos).
- `docker-compose.yml` → la receta para levantar la base de datos con Docker.
- `.env` → las "llaves" (dirección de la BD, secretos de sesión). No se sube al repo.
- `src/lib/` → donde viven los ayudantes del backend (la conexión a la BD, la sesión).

---

## 8. La lección que querías llevarte

Un sistema full stack no es "mucho código". Es **tres responsabilidades claras**
(vitrina, oficina, bóveda) que se hablan por un contrato (HTTP entre front y back,
un cliente entre back y base). Las herramientas (Docker, Prisma, NextAuth) son
ayudantes que hacen esa comunicación más fácil o más portable, pero podrías
reemplazarlas y la *lógica* del sistema seguiría siendo la misma.

Cuando leas el código después, no lo leas línea por línea: leelo preguntando
"sí, esto ¿a qué capa pertenece y qué responsabilidad está cumpliendo?".
