# Gestor de Activos Multimedia en la Nube (Cloud Media Vault)

Aplicación web para cargar, consultar y eliminar activos multimedia. La interfaz y la API se implementan con Next.js (App Router); los archivos se almacenan en Supabase Storage y sus metadatos en Neon PostgreSQL mediante Drizzle.

## Equipo y roles

| Integrante | Responsabilidad |
|---|---|
| Integrante 1: Juan Esteban Suarez Ordoñez | Roles 1 y 2 - Cloud, BD e Ingesta |
| Integrante 2: Sebastián Fernández Gómez | Rol 3 - Persistencia CRUD y Sincronización |
| Integrante 3: Angello Cortes Palomares | Roles 4 y 5 - Interfaz de Carga, Galería Multimedia y QA |

## Arquitectura

La aplicación mantiene las responsabilidades desacopladas: **Frontend → API REST de Next.js → Cloud Storage + Base de Datos**. El frontend envía solicitudes HTTP a `/api/archivos`; la API valida los datos, transfiere el archivo a Supabase Storage y persiste sus metadatos en Neon. El navegador no accede directamente a las credenciales de esos servicios. `publicId` vincula el objeto de Storage con su fila en la base de datos.

## Requisitos

- Node.js 22 o superior.
- Un proyecto de Supabase con un bucket público llamado `media-vault`.
- Una base PostgreSQL en Neon.

## Preparación local

1. Clona el repositorio desde GitHub y entra a la carpeta del proyecto:

   ```sh
   git clone <URL-del-repositorio>
   cd Taller-Cloud-Media-Vault
   ```

2. Copia el archivo de ejemplo para crear la configuración local. En PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   En macOS o Linux puedes usar `cp .env.example .env.local`.

3. Completa los valores de `.env.local` con las credenciales de desarrollo acordadas por el equipo. No publiques ese archivo ni agregues claves al frontend:

   | Variable | Uso |
   |---|---|
   | `SUPABASE_URL` | URL del proyecto de Supabase |
   | `SUPABASE_SECRET_KEY` | Clave privada usada por el servidor |
   | `SUPABASE_BUCKET` | Bucket de archivos; normalmente `media-vault` |
   | `DATABASE_URL` | Cadena de conexión de Neon |
   | `VAULT_WRITE_TOKEN` | Clave compartida requerida para POST y DELETE |

4. En Neon, ejecuta una vez el esquema de [`sql/001_archivos.sql`](sql/001_archivos.sql). Instala las dependencias:

   ```sh
   npm ci
   ```

5. Inicia el servidor local:

   ```sh
   npm run dev
   ```

6. Abre [http://localhost:3000](http://localhost:3000). Si el puerto está ocupado, usa la dirección que muestre Next.js.

## Interfaz

- El formulario admite selección por clic o arrastrar y soltar, valida el tipo y el límite de tamaño en el navegador y muestra el resultado de la subida.
- La galería consulta `GET /api/archivos`, permite filtrar por tipo y buscar por título. Las tarjetas muestran una vista previa, los metadatos y una acción de eliminación con confirmación.
- Las subidas y eliminaciones actualizan la galería sin recargar la página.
- La cuadrícula se adapta a móvil, tableta y escritorio.

El formulario acepta hasta 10 MB en el navegador. La API de este proyecto conserva un límite de servidor de 3 MiB (3.145.728 bytes); archivos mayores serán rechazados hasta que el límite de backend y el de hosting se ajusten conjuntamente.

## API y estado de integración

- `POST /api/archivos`: recibe `archivo`, `titulo` y `subidoPor` como `multipart/form-data`; requiere `X-Vault-Token`.
- `GET /api/archivos`: listado consumido por la galería.
- `DELETE /api/archivos/:id`: elimina el archivo y sus metadatos; requiere `X-Vault-Token`.

El contrato de `GET` y `DELETE` debe estar implementado por el rol 3 para que el listado y la eliminación funcionen de extremo a extremo. El guardado de Neon también debe estar conectado para que POST complete una subida persistida. La interfaz muestra errores devueltos por la API.

## Comprobaciones

```sh
npm test
npm run build
```

Para comprobar la conexión a Neon con `.env.local`, ejecuta `npm run check:db`.

## Seguridad

`.env.local` está excluido de Git. Comparte únicamente `.env.example`, que contiene valores de muestra. `SUPABASE_SECRET_KEY`, `DATABASE_URL` y `VAULT_WRITE_TOKEN` son datos sensibles; consérvalos en el servidor o en canales privados del equipo. El token de escritura que introduce el usuario se conserva en memoria en el cliente durante la sesión.
