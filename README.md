# Cloud Media Vault — base colaborativa

**Estado real:** roles 1 y 2 implementados y probados sin servicios reales. El taller completo todavía requiere el CRUD del rol 3 y la interfaz de los roles 4 y 5. No se entrega una galería terminada ni una persistencia ficticia. `POST /api/archivos` devuelve **501** con un formulario válido hasta que el rol 3 conecte su módulo; no deja archivos sin metadatos en ese estado.

## Equipo

Reemplazar los nombres pendientes antes de la entrega.

| Integrante | Responsabilidad | Rama |
|---|---|---|
| TU NOMBRE | Roles 1 y 2: cloud, esquema, variables, validación y subida | `feature/cloud-ingesta` |
| NOMBRE COMPAÑERO 2 | Rol 3: persistencia, GET y DELETE sincronizado | `feature/persistencia-crud` |
| NOMBRE COMPAÑERO 3 | Roles 4 y 5: formulario, galería, filtros y QA | `feature/frontend` |

El documento propone grupos de 4 o 5. Esta distribución adapta las responsabilidades a tres; comunicar la adaptación al docente.

## Arquitectura

El navegador envía FormData a Next.js. El Route Handler valida el cuerpo y transfiere el binario a Supabase Storage. Luego llama al módulo de persistencia del rol 3 para guardar únicamente metadatos en Neon PostgreSQL. Drizzle define el modelo y el cliente de base de datos. No hay Express, multer, XAMPP ni un segundo servidor. No se almacena el binario en la tabla ni en el disco del servidor.

El borrado final, que implementará el rol 3, debe retirar primero el objeto de Supabase y luego el registro de Neon. Son dos servicios: no existe una transacción ACID conjunta entre ambos. Se necesitan compensaciones y reintentos; ver `docs/CONTRATO_EQUIPO.md`.

## Ejecutar

Requisito: Node.js 22 o superior; recomendado Node.js 24 LTS.

1. `npm ci`
2. Copiar `.env.example` como `.env.local` y completar sus cinco variables.
3. Crear bucket público `media-vault` en Supabase con los límites de la guía.
4. Ejecutar `sql/001_archivos.sql` en Neon.
5. `npm run check:db`
6. `npm test`
7. `npm run dev`
8. Abrir http://localhost:3000.

No se necesitan credenciales para `npm test` ni `npm run build`.


## Formatos y límite

JPG, PNG, WebP, MP4 y PDF. Máximo **3 MiB = 3.145.728 bytes** por archivo. El límite contempla el techo de 4,5 MB por petición de Vercel; el taller propone, pero no impone, 10 MB. Si el docente exige 10 MB, presentar localmente con límites ajustados o cambiar la estrategia de hosting/subida. No basta con aumentar una variable para que Vercel reciba 10 MB.

## Seguridad de esta demo

Todas las claves de servicios se usan solo en servidor. El bucket permite lectura pública; usar material de prueba. La API exige una clave de escritura compartida en `X-Vault-Token`; no es la clave de Supabase. El frontend debe pedirla al usuario y conservarla solo en memoria. No es autenticación individual: `subidoPor` es un nombre declarado, no identidad verificada. El control por firma detecta formatos falsificados básicos; no es un antivirus ni certifica que un medio se pueda reproducir.

No versionar `.env.local`, `node_modules`, `.next` ni `.vercel`. Las variables secretas no llevan prefijo `NEXT_PUBLIC_`. Para una aplicación pública de uso continuo haría falta autenticación individual y límites de uso; este alcance es una demostración académica.

----

## IMPORTANTE ANGELLO Y SEBAS??--->Cómo continuar el proyecto

### 1. Clonar el repositorio y crear tu rama

1. Acepta la invitación al repositorio de GitHub.
2. En GitHub Desktop, entra a **File → Clone repository**, selecciona el repositorio del equipo y pulsa **Clone**.
3. Cambia a `main` y pulsa **Fetch origin**. Si aparece **Pull origin**, púlsalo para descargar los cambios.
4. Una vez incorporados los roles 1 y 2 a `main`, entra a **Current Branch → New Branch** y crea tu rama desde `main`:

   | Responsabilidad | Rama |
   |---|---|
   | Rol 3 — Persistencia, listado y eliminación | `feature/persistencia-crud` |
   | Roles 4 y 5 — Formulario, galería y pruebas de interfaz | `feature/frontend` |

5. Abre el proyecto con **Repository → Open in Visual Studio Code**.
6. Abre una terminal en la carpeta que contiene `package.json`. En Windows, puedes usar **Command Prompt (CMD)** desde VS Code.

### 2. Instalar y ejecutar el proyecto

Usa Node.js 22 o superior. Ejecuta:

```bat
npm ci
copy .env.example .env.local
```

El segundo comando crea `.env.local` en Windows CMD. Si ya tienes ese archivo configurado, conserva el existente.

Abre `.env.local`, completa las variables que correspondan y guarda. Luego ejecuta:

```bat
npm run dev
```

Abre `http://localhost:3000`. Si Next.js muestra otro puerto en la terminal, usa la URL que indique.

### 3. De dónde salen las conexiones

El equipo usa los proyectos de **Supabase** y **Neon** configurados por el responsable de los roles 1 y 2. Antes de trabajar con servicios reales, coordina con esa persona el acceso a los paneles o los valores de desarrollo que necesites, por un canal privado.

| Variable en `.env.local` | De dónde se obtiene | Para qué se usa |
|---|---|---|
| `SUPABASE_URL` | URL del proyecto de Supabase, con formato `https://….supabase.co` | Indica a qué proyecto se conecta el servidor |
| `SUPABASE_SECRET_KEY` | Clave secreta de servidor del proyecto de Supabase | Permite al backend subir y eliminar archivos |
| `SUPABASE_BUCKET` | Nombre del bucket del equipo, `media-vault` | Indica dónde se guardan los archivos |
| `DATABASE_URL` | Cadena completa de Neon, disponible en **Connect** para la rama y base acordadas | Permite al backend consultar la tabla `archivos` |
| `VAULT_WRITE_TOKEN` | Clave de escritura acordada por el equipo | Se envía en la cabecera `X-Vault-Token` al probar subidas y eliminaciones |

//ESTE ES EL PRIMER ARCHIVO .ENV si van agregar algo haganlo(si es necesario) en caso de que no, no mover nada de aqui PORFAVOR
//SUPABASE_URL=https://ffzetepcrfejyixwrvnu.supabase.co
SUPABASE_SECRET_KEY=sb_secret_4MqsF7VPYbeMoCeb4_HUuw_liOec1X2
SUPABASE_BUCKET=media-vault
DATABASE_URL=postgresql://neondb_owner:npg_oZe7LQM1Xahp@ep-little-bar-bd1h9bi2-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
//El frontend la pedirá al usuario y la enviará en X-Vault-Token.
VAULT_WRITE_TOKEN=3bc19bff0aa3606b0e751e120045c9f4bad0251299904b7a

//AQUI TERMINA EL .ENV
Recuerde que este archivo .env debe de estar en la raiz del proyecto.


Cada integrante guarda sus valores en su propio `.env.local`, junto a `package.json`. En GitHub solo se comparte `.env.example`, con valores de ejemplo. Mantén las claves reales fuera del código del frontend, los commits y las capturas.

**Supabase Storage** guarda los archivos físicos. En el panel, búscalos en **Storage → media-vault → archivos**. La conexión y las funciones de subida y eliminación están en `lib/storage.mjs`.

**Neon PostgreSQL** guarda los metadatos, como el título, la URL, el tamaño, el autor y el `publicId`. El cliente de conexión está en `lib/db/client.mjs`, el modelo está en `lib/db/schema.mjs` y el SQL de creación está en `sql/001_archivos.sql`. El `publicId` relaciona cada fila con su archivo en Supabase.

### 4. Comprobar los servicios desde tu computador

Para verificar que `DATABASE_URL` apunta a la base donde existe la tabla:

```bat
npm run check:db
```

Debe aparecer `OK: Neon conecta y la tabla archivos tiene las columnas esperadas.` Si falla, revisa que la cadena de conexión corresponda a la misma rama y base donde se ejecutó el SQL. Si la tabla ya existe, puedes continuar con ella.

Si tienes acceso al panel de Neon, abre **SQL Editor** y ejecuta:

```sql
SELECT * FROM archivos ORDER BY fecha_subida DESC;
```

Una tabla vacía es esperable antes de integrar la persistencia o hacer la primera subida completa.

Para probar Supabase con un PNG pequeño, reemplaza la ruta por la de tu archivo:

```bat
npm run test:storage -- "C:\ruta\foto.png" image/png
```

El script muestra la URL del archivo. Revisa que aparezca en el bucket y que la URL funcione. Después presiona **Enter** en la terminal para que el script retire ese objeto de prueba. Esta comprobación solo escribe en Supabase.

### 5. Qué debe hacer cada compañero

**Rol 3 — Persistencia y API**

1. Completa `lib/repositories/archivos.mjs` para guardar en Neon los metadatos que recibe del `POST`.
2. Agrega `GET /api/archivos` en `app/api/archivos/route.js`, conservando el `POST` existente.
3. Crea `DELETE /api/archivos/:id`. Usa el `publicId` del registro para eliminar primero el archivo en Supabase y después su fila en Neon.
4. Prueba que una subida válida devuelve `201` y aparece en ambos servicios. Luego comprueba que la eliminación lo retira de ambos.

Mientras el guardado esté pendiente, el `POST` válido devuelve `501` y se detiene antes de subir el archivo.

**Roles 4 y 5 — Formulario y galería**

1. Trabaja en `app/page.js`, `app/globals.css` y los componentes que necesites. Puedes avanzar con datos de ejemplo mientras se integra la API.
2. Envía `archivo`, `titulo` y `subidoPor` en `FormData` a `POST /api/archivos`. Para las operaciones de escritura, envía la clave de demo introducida por el usuario en `X-Vault-Token`.
3. Conecta la galería a `GET /api/archivos` y actualiza la vista después de subir o eliminar un archivo correctamente.
4. Prueba el recorrido completo una vez integrado el rol 3. El frontend se comunica con la API de Next.js mediante `/api/archivos`. Las conexiones con Supabase y Neon se ejecutan en el servidor.

### 6. Subir tu aporte

En GitHub Desktop, revisa **Changes**, crea commits con mensajes que describan tu aporte y pulsa **Publish branch** la primera vez o **Push origin** en los siguientes cambios. Abre un pull request hacia `main` e indica qué implementaste, qué probaste y qué sigue pendiente.

### DOCUMENTACION NUEVA Y CORREJIDA GRAMATICALMENTE Y CONFORME AL DESARROLLO

# Cloud Media Vault

Desarrollamos una aplicación web para subir, consultar y eliminar archivos multimedia. Usamos Next.js para la interfaz y la API, Supabase Storage para los archivos y Neon PostgreSQL para los metadatos, con Drizzle como ORM.

## Estado del primer avance

Ya incorporamos la configuración cloud, el esquema de metadatos, la validación del formulario y la transferencia a Supabase (roles 1 y 2). Podemos comprobar por separado la conexión a Neon, una subida real a Supabase y las respuestas HTTP en Postman.

Nos falta conectar el guardado definitivo en Neon, implementar el listado y el borrado sincronizado (rol 3), y construir el formulario y la galería (roles 4 y 5). Por eso, cuando enviamos un POST válido en este avance, esperamos **501**: superamos la validación y detenemos el flujo antes de subir el archivo.

## Equipo y ramas

Adaptamos los cinco roles a nuestro equipo de tres integrantes.

| Participación | Responsabilidad | Rama |
|---|---|---|
| Roles 1 y 2 | Configuramos los servicios, el esquema, las variables y la subida validada | `feature/cloud-ingesta` |
| Rol 3 | Implementaremos la persistencia, el listado y la eliminación sincronizada | `feature/persistencia-crud` |
| Roles 4 y 5 | Construiremos el formulario, la galería, los filtros y las pruebas de interfaz | `feature/frontend` |

## Cómo funciona

Enviamos el formulario como `FormData` a `POST /api/archivos`. El servidor valida los campos, el tamaño, el tipo MIME y la firma del archivo. En el flujo completo, guardamos primero el archivo en Supabase Storage y después sus metadatos en Neon. Usamos el `publicId` para vincular el objeto con su fila en la tabla `archivos`.

Aceptamos JPG, PNG, WebP, MP4 y PDF, hasta **3 MiB por archivo (3.145.728 bytes)**. Dejamos margen para el formulario multipart dentro del límite de 4,5 MB por petición de Vercel. Usamos archivos de prueba porque el bucket permite lectura pública.

## 1. Ejecutamos el proyecto en local

1. Clonamos el repositorio en GitHub Desktop con **File → Clone repository**. Para evaluar el avance, seleccionamos la rama donde esté publicado: `feature/cloud-ingesta` o `main` después de integrarlo.
2. Abrimos el repositorio en VS Code y una terminal en la carpeta que contiene `package.json`. Usamos Node.js 22 o superior.
3. Instalamos las dependencias:

   ```bat
   npm ci
   ```

4. Creamos `.env.local` junto a `package.json` a partir de `.env.example`. Si ya lo tenemos configurado, lo conservamos. En Windows CMD podemos copiar la plantilla con:

   ```bat
   copy .env.example .env.local
   ```

5. Completamos las variables según la siguiente sección y arrancamos:

   ```bat
   npm run dev
   ```

6. Abrimos `http://localhost:3000` o la dirección que indique Next.js. En el primer avance vemos una portada temporal.

## 2. Configuramos el acceso a Supabase y Neon

Reutilizamos el proyecto de Supabase con el bucket `media-vault` y el proyecto de Neon con la tabla `archivos`. Si necesitamos entrar a un panel, coordinamos una invitación con el responsable de los roles 1 y 2 y usamos nuestras propias cuentas. Para evaluar el flujo en local, coordinamos con el equipo los valores de prueba por un canal privado.

| Variable | De dónde la obtenemos |
|---|---|
| `SUPABASE_URL` | URL del proyecto de Supabase que contiene nuestro bucket |
| `SUPABASE_SECRET_KEY` | Clave de servidor del proyecto de Supabase |
| `SUPABASE_BUCKET` | Nombre del bucket compartido, `media-vault` |
| `DATABASE_URL` | Cadena completa de **Connect** en Neon, para la rama y la base donde creamos `archivos` |
| `VAULT_WRITE_TOKEN` | Clave de escritura que acordamos para la demo y enviamos en `X-Vault-Token` |

Guardamos las credenciales en `.env.local`. En GitHub versionamos `.env.example` con valores de muestra. Usamos las claves de Supabase y Neon solo en el servidor. En la interfaz pedimos únicamente la clave de escritura de la demo, que conservamos en memoria. El campo `subidoPor` registra el nombre que ingresamos en el formulario.

Quienes trabajamos en la persistencia necesitamos Neon y, para probar la subida y el borrado desde el servidor local, también la configuración de Supabase. Quienes trabajamos en la interfaz podemos comenzar con datos de ejemplo y probar la integración desde una instancia que el equipo tenga configurada, usando la clave de escritura para las operaciones que la requieren.

## 3. Verificamos los servicios y la compilación

**Neon.** Ejecutamos `npm run check:db`. Esperamos ver `OK: Neon conecta y la tabla archivos tiene las columnas esperadas.` Si la tabla ya existe, seguimos usando el mismo esquema. Si configuramos una base nueva para pruebas, ejecutamos `sql/001_archivos.sql` en su **SQL Editor**. Podemos consultar la tabla con:

```sql
SELECT * FROM archivos ORDER BY fecha_subida DESC;
```

En el primer avance podemos encontrar la tabla vacía porque el POST todavía no guarda metadatos.

**Supabase.** Probamos una subida real con el siguiente comando y reemplazamos la ruta por la de un PNG válido de menos de 3 MiB:

```bat
npm run test:storage -- "C:/ruta/foto.png" image/png
```

Abrimos la URL que muestra la terminal y comprobamos que el objeto aparece en **Storage → media-vault → archivos**. Volvemos a la terminal y presionamos **Enter** para retirar ese objeto de prueba. En esta comprobación solo escribimos en Supabase.

**Pruebas y compilación.** Ejecutamos `npm test` y `npm run build` con el servidor de desarrollo detenido. En la base del primer avance esperamos 18 pruebas aprobadas y una compilación exitosa. Estos dos comandos se pueden ejecutar sin credenciales.

## 4. Comprobamos las respuestas HTTP en Postman

1. Mantenemos `npm run dev` en ejecución y creamos una petición **POST** a `http://localhost:3000/api/archivos`. Si Next.js muestra otro puerto, lo usamos en la URL.
2. En **Headers** de la petición agregamos y activamos `X-Vault-Token`. En **Value** pegamos solo el valor de `VAULT_WRITE_TOKEN`, sin `Bearer` ni el nombre de la variable.
3. En **Body → form-data** agregamos los siguientes campos:

   | Key | Tipo | Valor de prueba |
   |---|---|---|
   | `titulo` | Text | Prueba HTTP del primer avance |
   | `subidoPor` | Text | Nuestro nombre |
   | `archivo` | File | Un PNG válido de menos de 3 MiB |

4. Dejamos que Postman genere `Content-Type` automáticamente. Pulsamos **Send** y miramos el código HTTP y el mensaje JSON en el panel de respuesta. También podemos ver el código en la terminal de Next.js.

Partimos de la petición válida y cambiamos un elemento por prueba. Lo restauramos antes del siguiente caso.

| Caso | Respuesta esperada |
|---|---|
| Clave correcta, campos completos y PNG válido | **501**. La validación pasó y queda pendiente conectar el guardado del rol 3. |
| Desactivamos `X-Vault-Token` | **401**. Falta la clave de escritura. |
| Desmarcamos `subidoPor` | **400**. Falta el autor. |
| Cambiamos el PNG por un TXT pequeño | **415**. El formato no está admitido. |
| Seleccionamos un PNG superior a 3.145.728 bytes | **413**. Superamos el límite de archivo o de petición. |

Si obtenemos **401** con la petición válida, revisamos que la cabecera esté activa y coincida con `.env.local`. Si cambiamos ese archivo, reiniciamos el servidor.

El **501** del primer avance no crea un objeto ni una fila. Para demostrar la subida real en esta etapa usamos `npm run test:storage`. Cuando integremos la persistencia, repetiremos el caso válido y esperaremos **201 Created**, un objeto en Supabase y una fila en Neon.

## 5. Continuamos el trabajo en equipo

Cuando los roles 1 y 2 estén integrados en `main`, actualizamos esa rama con **Fetch origin** y **Pull origin** si aparece. Desde ese punto creamos la rama que corresponda a nuestro aporte.

**Persistencia y API (rol 3).** Completamos `lib/repositories/archivos.mjs` usando el cliente de `lib/db/client.mjs` y el esquema de `lib/db/schema.mjs`. Agregamos `GET /api/archivos` en `app/api/archivos/route.js` conservando el POST. Implementamos `DELETE /api/archivos/:id` retirando primero el objeto en Supabase mediante `lib/storage.mjs` y luego la fila en Neon. Como operamos en dos servicios, contemplamos errores parciales y reintentos.

**Formulario y galería (roles 4 y 5).** Desarrollamos la interfaz en `app/page.js`, `app/globals.css` y nuestros componentes. Enviamos `archivo`, `titulo` y `subidoPor` mediante `FormData`. Usamos `GET /api/archivos` para la galería y actualizamos la vista tras una subida o eliminación exitosa. En las operaciones de escritura enviamos `X-Vault-Token`.

En GitHub Desktop revisamos **Changes**, hacemos commits en nuestra rama, usamos **Publish branch** o **Push origin** y abrimos un pull request hacia `main`. En el PR registramos qué implementamos, qué comprobamos y qué queda pendiente.

