'use client';

import { useState } from 'react';
import { eliminarArchivo } from '../services/archivosService';
import { formatearFecha, formatearTamano } from '../utils/formatoArchivo';

function tipoDeArchivo(archivo) {
  const tipo = String(archivo.tipoArchivo || '').toLowerCase();
  const referencia = `${archivo.url || ''} ${archivo.publicId || ''}`.toLowerCase();
  if (tipo.includes('image') || tipo.includes('imagen')) return 'imagen';
  if (tipo.includes('video')) return 'video';
  if (tipo.includes('pdf') || referencia.includes('.pdf') || tipo === 'documento') return 'pdf';
  return 'archivo';
}

const etiquetas = { imagen: 'Imagen', video: 'Video', pdf: 'PDF', archivo: 'Archivo' };

export default function MediaCard({ archivo, onDeleteSuccess }) {
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const tipo = tipoDeArchivo(archivo);

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar “${archivo.titulo}”? Esta acción no se puede deshacer.`)) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      await eliminarArchivo(archivo.id);
      onDeleteSuccess?.(archivo.id);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'No se pudo eliminar el archivo.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className="media-card">
      <div className={`media-card__preview media-card__preview--${tipo}`}>
        {tipo === 'imagen' ? (
          imageError ? (
            <div className="media-card__fallback" role="img" aria-label="No se pudo cargar la imagen">
              <span aria-hidden="true">▧</span><span>No se pudo cargar la imagen</span>
            </div>
          ) : (
            <>
              <img className="media-card__image" src={archivo.url} alt={archivo.titulo} loading="lazy"
                onError={() => setImageError(true)} />
              <a className="media-card__open-image" href={archivo.url} target="_blank" rel="noreferrer">
                Ver tamaño completo
              </a>
            </>
          )
        ) : tipo === 'video' ? (
          <video controls preload="metadata" src={archivo.url} aria-label={`Reproductor: ${archivo.titulo}`}>
            Tu navegador no puede reproducir este video.
          </video>
        ) : tipo === 'pdf' ? (
          <>
            <iframe title={`Vista previa: ${archivo.titulo}`} src={archivo.url} />
            <a className="media-card__pdf-open" href={archivo.url} target="_blank" rel="noreferrer">
              Abrir PDF ↗
            </a>
          </>
        ) : (
          <div className="media-card__fallback" role="img" aria-label="Vista previa no disponible">
            <span aria-hidden="true">▧</span>
            <span>Vista previa no disponible</span>
          </div>
        )}
      </div>

      <div className="media-card__body">
        <div className="media-card__title-row">
          <h3 title={archivo.titulo}>{archivo.titulo}</h3>
          <span className={`type-badge type-badge--${tipo}`}>{etiquetas[tipo]}</span>
        </div>
        <p className="media-card__size">{formatearTamano(archivo.tamanoBytes)}</p>
        <div className="media-card__metadata">
          <span>Por <strong>{archivo.subidoPor}</strong></span>
          <time dateTime={archivo.fechaSubida}>{formatearFecha(archivo.fechaSubida)}</time>
        </div>
        {deleteError && <p className="media-card__error" role="alert">{deleteError}</p>}
        <button className="media-card__delete" type="button" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? <><span className="spinner spinner--dark" aria-hidden="true" /> Eliminando…</> : 'Eliminar'}
        </button>
      </div>
    </article>
  );
}
