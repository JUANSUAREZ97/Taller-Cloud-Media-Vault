import test from 'node:test';
import assert from 'node:assert/strict';
import { ingest } from '../lib/ingest.mjs';
import { validateForm } from '../lib/validation.mjs';
import { readLimitedForm } from '../lib/read-form.mjs';
import { MAX_BYTES, MAX_REQUEST_BYTES } from '../lib/limits.mjs';
import { AppError } from '../lib/errors.mjs';
import { POST } from '../app/api/archivos/route.js';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jv1sAAAAASUVORK5CYII=',
  'base64'
);

function form(bytes = png, mime = 'image/png') {
  const f = new FormData();
  f.set('titulo', 'Imagen de prueba');
  f.set('subidoPor', 'Integrante');
  f.set('archivo', new File([bytes], 'ejemplo.png', { type: mime }));
  return f;
}

function deps(overrides = {}) {
  const calls = [];
  return {
    calls,
    ensureReady: async () => {
      calls.push('ready');
    },
    upload: async () => {
      calls.push('upload');
      return { publicId: 'archivos/prueba.png', url: 'https://example.com/prueba.png' };
    },
    save: async (m) => {
      calls.push('save');
      return { ...m, id: 'id-test', fechaSubida: '2026-11-16T00:00:00Z' };
    },
    remove: async (id) => {
      calls.push(`remove:${id}`);
    },
    ...overrides,
  };
}

const fails = (status) => (e) => e instanceof AppError && e.status === status;

test('PNG válido: categoría, bytes y nombre conservados', async () => {
  const v = await validateForm(form());
  assert.equal(v.metadata.tipoArchivo, 'imagen');
  assert.equal(v.metadata.tamanoBytes, png.length);
});

test('PDF y MP4: detección de sus firmas', async () => {
  for (const [bytes, mime, category] of [
    [Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'), 'application/pdf', 'documento'],
    [Buffer.from('00000018667479706d703432000000006d70343269736f6d', 'hex'), 'video/mp4', 'video'],
  ]) {
    assert.equal((await validateForm(form(bytes, mime))).metadata.tipoArchivo, category);
  }
});

test('413: archivo demasiado grande', async () => {
  await assert.rejects(validateForm(form(Buffer.alloc(MAX_BYTES + 1))), fails(413));
});

test('415: MIME no permitido', async () => {
  await assert.rejects(validateForm(form(png, 'text/html')), fails(415));
});

test('415: archivo renombrado no engaña la validación', async () => {
  await assert.rejects(validateForm(form(Buffer.from('no soy PNG'))), fails(415));
});

test('415: firma y MIME no coinciden', async () => {
  await assert.rejects(validateForm(form(png, 'application/pdf')), fails(415));
});

test('400: archivo vacío', async () => {
  await assert.rejects(validateForm(form(Buffer.alloc(0))), fails(400));
});

test('400: título, autor o archivo ausentes', async () => {
  for (const key of ['titulo', 'subidoPor', 'archivo']) {
    const f = form();
    f.delete(key);
    await assert.rejects(validateForm(f), fails(400));
  }
});

test('400: campos duplicados o título largo', async () => {
  const f = form();
  f.append('archivo', new File([png], 'otro.png', { type: 'image/png' }));
  await assert.rejects(validateForm(f), fails(400));

  const g = form();
  g.set('titulo', 'x'.repeat(121));
  await assert.rejects(validateForm(g), fails(400));
});

test('sube antes de persistir y devuelve la fila guardada', async () => {
  const d = deps();
  const row = await ingest(form(), d);
  assert.deepEqual(d.calls, ['ready', 'upload', 'save']);
  assert.equal(row.id, 'id-test');
  assert.equal(row.publicId, 'archivos/prueba.png');
});

test('501 sin rol 3: no sube ningún objeto', async () => {
  const d = deps({
    ensureReady: async () => {
      throw new AppError(501, 'Pendiente');
    },
  });
  await assert.rejects(ingest(form(), d), fails(501));
  assert.deepEqual(d.calls, []);
});

test('fallo cloud: no persiste', async () => {
  const d = deps({
    upload: async () => {
      throw new AppError(502, 'Cloud');
    },
  });
  await assert.rejects(ingest(form(), d), fails(502));
  assert.deepEqual(d.calls, ['ready']);
});

test('fallo de persistencia: compensa retirando el objeto', async () => {
  const d = deps({
    save: async () => {
      throw new Error('DB');
    },
  });
  await assert.rejects(ingest(form(), d), fails(502));
  assert.deepEqual(d.calls, ['ready', 'upload', 'remove:archivos/prueba.png']);
});

test('fallo de compensación: requiere reconciliación', async () => {
  const d = deps({
    save: async () => {
      throw new Error('DB');
    },
    remove: async () => {
      throw new Error('Cloud');
    },
  });
  await assert.rejects(ingest(form(), d), fails(503));
});

test('multipart válido se puede leer', async () => {
  const request = new Request('http://localhost/api/archivos', { method: 'POST', body: form() });
  assert.equal((await readLimitedForm(request)).get('titulo'), 'Imagen de prueba');
});

test('cuerpo excesivo sin Content-Length también se rechaza', async () => {
  const request = new Request('http://localhost/api/archivos', {
    method: 'POST',
    headers: { 'content-type': 'multipart/form-data; boundary=test' },
    body: Buffer.alloc(MAX_REQUEST_BYTES + 1),
  });
  await assert.rejects(readLimitedForm(request), fails(413));
});

test('JSON y multipart roto se rechazan', async () => {
  await assert.rejects(
    readLimitedForm(
      new Request('http://localhost', {
        method: 'POST',
        body: '{}',
        headers: { 'content-type': 'application/json' },
      })
    ),
    fails(415)
  );
  await assert.rejects(
    readLimitedForm(
      new Request('http://localhost', {
        method: 'POST',
        body: 'bad',
        headers: { 'content-type': 'multipart/form-data; boundary=test' },
      })
    ),
    fails(400)
  );
});

test('handler real: 401 sin clave y 501 con formulario válido antes del rol 3', async () => {
  process.env.VAULT_WRITE_TOKEN = 'clave-de-prueba-no-real';

  assert.equal(
    (await POST(new Request('http://localhost', { method: 'POST', body: form() }))).status,
    401
  );

  const response = await POST(
    new Request('http://localhost', {
      method: 'POST',
      body: form(),
      headers: { 'x-vault-token': process.env.VAULT_WRITE_TOKEN },
    })
  );
  assert.equal(response.status, 501);
  assert.match((await response.json()).error, /rol 3/);

  delete process.env.VAULT_WRITE_TOKEN;
});