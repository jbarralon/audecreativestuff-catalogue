import React, { useState, useEffect } from 'react'
import CSVUploader from './components/CSVUploader'
import DataDisplay from './components/DataDisplay'
import PDFGenerator from './components/PDFGenerator'
import { loadCSVFromFile, loadDefaultCSV } from './services/csvParser'
import './styles/App.css'

function App() {
  const [csvData, setCsvData] = useState(null)
  const [selectedIndices, setSelectedIndices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    handleLoadDefault()
  }, [])

  const handleLoadDefault = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await loadDefaultCSV()
      setCsvData(data)
      setSelectedIndices(data.map((_, index) => index))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleDataLoaded = async (file) => {
    setLoading(true)
    setError(null)
    try {
      const data = file ? await loadCSVFromFile(file) : await loadDefaultCSV()
      setCsvData(data)
      setSelectedIndices(data.map((_, index) => index))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Générateur de Catalogue PDF</h1>
      </header>

      <main className="app-main">
        {!csvData && (
          <CSVUploader
            onDataLoaded={handleDataLoaded}
            loading={loading}
          />
        )}

        {error && (
          <div className="error-message">
            Erreur: {error}
          </div>
        )}

        {csvData && (
          <>
            <div className="data-actions">
              <button onClick={() => setCsvData(null)} className="btn-reset">
                Charger un nouveau fichier CSV
              </button>
            </div>

            <DataDisplay
              data={csvData}
              onSelectionChange={setSelectedIndices}
            />
            <PDFGenerator
              data={csvData}
              selectedIndices={selectedIndices}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App