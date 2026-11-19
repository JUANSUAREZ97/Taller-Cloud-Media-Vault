'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerArchivos } from '../services/archivosService';
import MediaCard from './MediaCard';

const filtros = [
  { id: 'todos', label: 'Todos' },
  { id: 'imagen', label: 'Imágenes' },
  { id: 'video', label: 'Videos' },
  { id: 'pdf', label: 'PDFs' },
];

function coincideCategoria(archivo, categoria) {
  if (categoria === 'todos') return true;
  const tipo = String(archivo.tipoArchivo || '').toLowerCase();
  if (categoria === 'imagen') return tipo.includes('imagen') || tipo.includes('image');
  if (categoria === 'video') return tipo.includes('video');
  return tipo.includes('pdf') || tipo === 'documento'
    || `${archivo.url || ''} ${archivo.publicId || ''}`.toLowerCase().includes('.pdf');
}

export default function MediaGallery({ nuevoArchivo }) {
  const [archivos, setArchivos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoria, setCategoria] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const cargarArchivos = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const recibidos = await obtenerArchivos();
      setArchivos((actuales) => {
        const ids = new Set();
        return [...actuales, ...recibidos].filter((archivo) => {
          if (ids.has(archivo.id)) return false;
          ids.add(archivo.id);
          return true;
        });
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No pudimos cargar la galería.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargarArchivos(); }, [cargarArchivos]);

  useEffect(() => {
    if (!nuevoArchivo) return;
    setArchivos((actuales) => [
      nuevoArchivo,
      ...actuales.filter((archivo) => archivo.id !== nuevoArchivo.id),
    ]);
    setCategoria('todos');
    setBusqueda('');
  }, [nuevoArchivo]);

  const archivosVisibles = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es');
    return archivos.filter((archivo) => coincideCategoria(archivo, categoria)
      && String(archivo.titulo || '').toLocaleLowerCase('es').includes(texto));
  }, [archivos, categoria, busqueda]);

  return (
    <section className="gallery-section" aria-labelledby="gallery-title">
      <div className="gallery-heading">
        <div>
          <p className="eyebrow">TU BIBLIOTECA</p>
          <h2 id="gallery-title">Galería multimedia</h2>
        </div>
        {!isLoading && !error && <span className="gallery-count">{archivos.length} {archivos.length === 1 ? 'archivo' : 'archivos'}</span>}
      </div>

      <div className="gallery-controls">
        <div className="gallery-tabs" role="group" aria-label="Filtrar por categoría">
          {filtros.map((filtro) => (
            <button key={filtro.id} type="button"
              className={`gallery-tab${categoria === filtro.id ? ' gallery-tab--active' : ''}`}
              aria-pressed={categoria === filtro.id} onClick={() => setCategoria(filtro.id)}>
              {filtro.label}
            </button>
          ))}
        </div>
        <label className="gallery-search">
          <span className="gallery-search__icon" aria-hidden="true">⌕</span>
          <input type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por título" aria-label="Buscar archivos por título" />
        </label>
      </div>

      {isLoading && archivos.length === 0 ? (
        <div className="gallery-grid" aria-label="Cargando archivos" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => <div className="media-skeleton" key={index} />)}
        </div>
      ) : error && archivos.length === 0 ? (
        <div className="gallery-state gallery-state--error" role="alert">
          <p>No se pudo cargar la galería. {error}</p>
          <button className="button button--secondary" type="button" onClick={cargarArchivos}>Reintentar</button>
        </div>
      ) : archivosVisibles.length === 0 ? (
        <div className="gallery-state">
          <span className="gallery-state__icon" aria-hidden="true">▤</span>
          <h3>{archivos.length === 0 ? 'Tu galería está vacía' : 'No encontramos archivos'}</h3>
          <p>{archivos.length === 0
            ? 'Cuando subas imágenes, videos o PDFs, aparecerán aquí.'
            : 'Prueba con otra búsqueda o categoría.'}</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {archivosVisibles.map((archivo) => <MediaCard key={archivo.id} archivo={archivo} />)}
        </div>
      )}
    </section>
  );
}
