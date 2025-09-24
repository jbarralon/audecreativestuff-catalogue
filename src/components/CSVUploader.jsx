import React, { useRef, useState } from 'react'

const CSVUploader = ({ onDataLoaded, loading }) => {
  const fileInputRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleFile = async (file) => {
    if (file && file.type === 'text/csv') {
      setFileName(file.name)
      await onDataLoaded(file)
    } else {
      alert('Veuillez sélectionner un fichier CSV valide')
    }
  }

  const handleFileInput = async (e) => {
    const file = e.target.files[0]
    if (file) {
      await handleFile(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0])
    }
  }

  const handleLoadDefault = async () => {
    try {
      setFileName('catalogue.csv (fichier par défaut)')
      await onDataLoaded(null)
    } catch (error) {
      alert('Erreur lors du chargement du fichier par défaut: ' + error.message)
    }
  }

  return (
    <div className="csv-uploader">
      <h2>Charger un fichier CSV</h2>

      <div className="upload-options">
        <div
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current.click()}
        >
          <svg
            className="upload-icon"
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          <p className="drop-text">
            {loading
              ? 'Chargement...'
              : 'Glissez-déposez votre fichier CSV ici ou cliquez pour parcourir'}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            disabled={loading}
          />

          {fileName && (
            <p className="file-name">
              Fichier sélectionné: <strong>{fileName}</strong>
            </p>
          )}
        </div>

        <div className="divider">
          <span>OU</span>
        </div>

        <button
          onClick={handleLoadDefault}
          disabled={loading}
          className="btn-load-default"
        >
          {loading ? 'Chargement...' : 'Charger le catalogue par défaut'}
        </button>
      </div>

      <p className="info-text">
        Format accepté: CSV (valeurs séparées par des virgules)
      </p>
    </div>
  )
}

export default CSVUploader