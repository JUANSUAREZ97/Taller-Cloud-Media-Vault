'use client';

import { useRef, useState } from 'react';
import { establecerTokenVault, subirArchivo } from '../services/archivosService';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function validarArchivo(file) {
  if (file.size > MAX_FILE_SIZE) return 'El archivo supera el máximo permitido de 10 MB.';
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.type !== 'application/pdf') {
    return 'Formato no permitido. Selecciona una imagen, un video o un documento PDF.';
  }
  return '';
}

export default function UploadForm({ onUploadSuccess }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [token, setToken] = useState('');

  function selectFile(candidate) {
    if (!candidate) return;
    const error = validarArchivo(candidate);
    setMessage(error ? { type: 'error', text: error } : null);
    setFile(error ? null : candidate);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);
    if (!file) {
      setMessage({ type: 'error', text: 'Selecciona una imagen, un video o un PDF válido.' });
      return;
    }
    const fileError = validarArchivo(file);
    if (fileError) {
      setMessage({ type: 'error', text: fileError });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set('archivo', file);
    establecerTokenVault(token);
    setIsUploading(true);
    try {
      const nuevoArchivo = await subirArchivo(formData);
      form.reset();
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setMessage({ type: 'success', text: 'El archivo se subió correctamente.' });
      onUploadSuccess?.(nuevoArchivo);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo subir el archivo.' });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="upload-form__fields">
        <label>Título del archivo
          <input name="titulo" type="text" maxLength={120} required disabled={isUploading} />
        </label>
        <label>Nombre del autor
          <input name="subidoPor" type="text" maxLength={80} required disabled={isUploading} />
        </label>
        <label>Clave de escritura
          <input name="vaultToken" type="password" autoComplete="off" value={token}
            onChange={(event) => {
              setToken(event.target.value);
              establecerTokenVault(event.target.value);
            }} required disabled={isUploading} />
        </label>
      </div>

      <div
        className={`upload-dropzone${isDragging ? ' upload-dropzone--active' : ''}${file ? ' upload-dropzone--selected' : ''}`}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false); }}
        onDrop={handleDrop}
      >
        <input ref={inputRef} className="upload-dropzone__input" type="file"
          accept="image/*,video/*,application/pdf" aria-label="Seleccionar archivo multimedia"
          disabled={isUploading} onChange={(event) => selectFile(event.target.files?.[0])} />
        <span className="upload-dropzone__icon" aria-hidden="true">↑</span>
        <strong>{isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o selecciónalo'}</strong>
        <span>Imágenes, videos o PDF · máximo 10 MB</span>
        {file && <span className="upload-dropzone__filename">{file.name}</span>}
        <button className="button button--secondary" type="button" disabled={isUploading}
          onClick={() => inputRef.current?.click()}>Elegir archivo</button>
      </div>

      {message && <p className={`upload-message upload-message--${message.type}`}
        role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</p>}
      <button className="button upload-submit" type="submit" disabled={isUploading}>
        {isUploading ? <><span className="spinner" aria-hidden="true" /> Subiendo…</> : 'Subir archivo'}
      </button>
    </form>
  );
}
