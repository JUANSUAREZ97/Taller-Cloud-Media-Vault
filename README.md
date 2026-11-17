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

## Documentación

- [Guía desde cero](GUIA_PASO_A_PASO.md): instalación, servicios, GitHub Desktop, ramas, pruebas, despliegue y demostración.
- [Contrato entre roles](docs/CONTRATO_EQUIPO.md): archivos de cada compañero, API y condiciones de integración.
- [Verificación](docs/VERIFICACION.md): pruebas realizadas y pendientes.

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

Consulta [el contrato del equipo](docs/CONTRATO_EQUIPO.md) para ver los campos, los filtros y las respuestas acordadas.

### 6. Subir tu aporte

En GitHub Desktop, revisa **Changes**, crea commits con mensajes que describan tu aporte y pulsa **Publish branch** la primera vez o **Push origin** en los siguientes cambios. Abre un pull request hacia `main` e indica qué implementaste, qué probaste y qué sigue pendiente.