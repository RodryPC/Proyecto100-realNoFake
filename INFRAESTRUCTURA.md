# INFRAESTRUCTURA.md — Por qué tu sistema funciona gracias a las herramientas

> Complemento de `ARQUITECTURA.md`. Allá viste la *lógica* (vitrina, oficina, bóveda).
> Acá vas a ver el *andamiaje*: las cosas que vos no escribiste, pero que hacen
> posible que el sistema exista y corra. El objetivo es que seas **consciente** de
> qué herramienta sostiene qué parte, y por qué sin ella todo se caería.
>
> Regla de este archivo: solo **conceptos**. Cero sintaxis, cero comandos concretos,
> cero líneas de configuración. Si querés el "cómo se escribe", ese no es el nivel.

---

## 1. La idea central: vos construiste la lógica, las herramientas construyen el suelo

Imaginate que `ARQUITECTURA.md` es el plano de una casa (habitaciones, puertas,
para qué sirve cada cosa). Este archivo es el terreno, los cimientos, el agua y la
luz: cosas que no diseñaste vos, pero sin las cuales la casa no se puede habitar.

En un sistema, la "lógica" (tu código) necesita un **suelo** que le dé:
- un lugar donde ejecutarse,
- una forma de guardar datos que sobreviva,
- un idioma común para hablar con la base de datos,
- una forma de saber quién es cada usuario,
- una forma de que todo arranque igual en cualquier computadora.

Eso lo resuelven las herramientas. Vamos una por una, siempre al nivel de concepto.

---

## 2. Docker — el "suelo aislado y repetible"

**Concepto:** Docker encapsula un programa (acá: la base de datos) junto con todo lo
que necesita para correr, dentro de algo llamado *contenedor*. El contenedor es
como una cajita aislada: lo que pasa adentro no ensucia tu sistema operativo y viceversa.

**Por qué importa a TU sistema:**
- Sin Docker tendrías que instalar PostgreSQL a mano en tu máquina, configurarlo, y
  rezar para que en otra computadora funcione igual. Docker elimina esa variable:
  "la base de datos corre adentro de Docker" significa que **siempre es la misma**,
  donde la corras.
- Tus datos NO viven dentro del contenedor efímero. Docker usa un *volumen*: un
  espacio de disco separado que sobrevive aunque apagues y borres el contenedor.
  Por eso tus gastos no se pierden al reiniciar. Este es un concepto clave:
  **contenedor = efímero; volumen = persistente**.

**Lo que ganás (conciencia):** tu sistema no depende de "tu computadora". Depende de
un contrato: "habrá una base de datos escuchando en el puerto 5432". Eso es todo lo
que tu lógica necesita saber de Docker.

---

## 3. PostgreSQL — la base de datos como "estado durable"

**Concepto:** es un sistema de gestión de base de datos relacional. En criollo: un
programa especializado en guardar datos en tablas y mantenerlos coherentes, rápidos
de buscar y seguros de recuperar.

**Por qué importa a TU sistema:** tu lógica (gastos, grupos, usuarios) necesita un
lugar que **recuerde**. La memoria de la app se borra al reiniciar; la base de datos
no. PostgreSQL es la "bóveda" del `ARQUITECTURA.md` hecha realidad.

**Lo que ganás (conciencia):** la base de datos es la única fuente de verdad. Si el
frontend muestra algo, es porque la base lo tiene. Entender eso te salva de bugs
mentales tipo "cambié el código y no se refleja" → casi siempre es un problema de
qué hay (o no) en la base.

---

## 4. Prisma — el "traductor" entre tu lenguaje y la base

**Concepto:** Prisma es un *ORM* (Object-Relational Mapper). Su trabajo conceptual es
traducir: vos escribís en el lenguaje de tu backend ("creá un gasto"), y Prisma lo
convierte al lenguaje que entiende PostgreSQL ("INSERT en la tabla...").

**Por qué importa a TU sistema:**
- Vos no escribís SQL a mano. Definís el esquema (las tablas) una vez, y Prisma se
  encarga de crearlo en la base y de darte funciones para leer/escribir.
- También es el **puente de tipos**: lo que definís en el esquema se vuelve
  conocido por tu backend, así el editor y el compilador te avisan si te equivocás.

**Lo que ganás (conciencia):** Prisma es el ayudante que mantiene a tu backend y a tu
base "hablando el mismo idioma". Si lo sacás, tendrías que hablar SQL directo — el
sistema funcionaría, pero con más fricción. Por eso lo llamamos "herramienta que
hace posible", no "parte de la lógica".

---

## 5. Next.js — el "runtime unificado" (front y back en uno)

**Concepto:** Next.js es un framework que te deja escribir la interfaz (React) y la
lógica del servidor (los endpoints) en el mismo proyecto y, a menudo, con el mismo
lenguaje y herramientas.

**Por qué importa a TU sistema:**
- Vos no corrés "dos programas". Corrés uno solo, y él decide qué parte se muestra
  en el navegador y qué parte se ejecuta en el servidor.
- Eso simplifica todo el andamiaje: un solo proceso, un solo puerto (el 3000), una
  sola forma de arrancar. Es la razón por la que tu proyecto es un *monolito* y no
  dos servicios separados.

**Lo que ganás (conciencia):** gracias a Next.js, la frontera front/back es una
*decisión de arquitectura*, no una fractura física. Vos decidís qué va al servidor;
la herramienta se encarga de que ambos mundos convivan sin que las armes.

---

## 6. NextAuth — la "identidad persistente"

**Concepto:** NextAuth es una librería de autenticación. Su responsabilidad conceptual
es responder una pregunta que todo sistema multi-usuario tiene: **¿quién está
haciendo este pedido?**

**Por qué importa a TU sistema:**
- Sin esto, cada vez que el backend recibe "creá un gasto", no sabría de quién es.
- NextAuth guarda una *sesión*: una credencial que el navegador lleva puesta y
  presenta en cada pedido, así el backend puede decir "esto lo hizo el usuario X" sin
  pedirle la contraseña en cada click.

**Lo que ganás (conciencia):** la sesión es lo que separa "un usuario anónimo" de
"vos". Es invisible, pero sostiene toda la parte de permisos (qué grupos podés ver,
qué gastos podés crear). Sin NextAuth, tendrías que inventar esa rueda vos.

---

## 7. TypeScript — el "control de tipos" (mencionado porque lo usás)

**Concepto:** TypeScript añade tipos al lenguaje. No es runtime (no corre en
producción), es una *red de seguridad* en tiempo de desarrollo: te avisa antes de
correr si estás usando una cosa que no existe o con la forma incorrecta.

**Por qué importa a TU sistema:** no cambia la lógica en runtime, pero evita que
cometas errores tontos que romperían el flujo. Es andamiaje de *calidad*, no de
*funcionamiento en vivo*.

---

## 8. El "por qué funciona" resumido

Ponelo en una frase por herramienta, para tener la foto completa:

- **Docker** → da un suelo aislado y repetible donde la base de datos vive igual en cualquier máquina, y un volumen que no pierde tus datos.
- **PostgreSQL** → es la memoria durable del sistema; la única fuente de verdad.
- **Prisma** → traduce tu lógica a la base y mantiene los tipos alineados.
- **Next.js** → unifica front y back en un solo programa que podés arrancar con un comando.
- **NextAuth** → mantiene la identidad del usuario viva entre pedidos.
- **TypeScript** → te frena antes de cometer errores que romperían el flujo.

Ninguna de estas es "tu lógica". Todas son el **suelo** sobre el cual tu lógica camina.
Por eso el sistema "simplemente funciona": vos escribiste la casa, y estas
herramientas pusieron el terreno, el agua y la luz.

---

## 9. Ejercicio de conciencia (para vos)

Cada vez que el sistema haga algo que "parece magia", preguntate:
**"¿esto lo decidió mi lógica, o lo hizo posible una herramienta?"**

- "Creé un gasto y apareció en la lista" → tu lógica + PostgreSQL que guardó.
- "Recargué la página y seguí logueado" → NextAuth (sesión), no tu código.
- "Lo abrí en otra compu y anduvo igual" → Docker (mismo suelo).
- "El editor me marcó un error antes de correr" → TypeScript.

Esa pregunta es el músculo que este archivo quería dejarte.
