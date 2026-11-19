'use client';

import { useState } from 'react';
import UploadForm from '../src/components/UploadForm';

export default function Home() {
  const [ultimoArchivo, setUltimoArchivo] = useState(null);

  return (
    <main>
      <p className="eyebrow">TALLER COLABORATIVO / CLOUD MEDIA VAULT</p>
      <h1>Cloud Media Vault</h1>
      <p className="page-intro">Carga y organiza tus activos multimedia en un solo lugar.</p>
      <section className="panel upload-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">NUEVO ACTIVO</p><h2>Subir un archivo</h2></div>
          <span className="panel-badge">Hasta 10 MB</span>
        </div>
        <UploadForm onUploadSuccess={setUltimoArchivo} />
      </section>
      {ultimoArchivo && <p className="upload-complete" role="status">
        “{ultimoArchivo.titulo}” ya está listo para aparecer en la galería.
      </p>}
    </main>
  );
}
