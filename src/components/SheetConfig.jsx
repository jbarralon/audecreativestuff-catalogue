import React from 'react'

const SheetConfig = ({ sheetUrl, setSheetUrl, onFetchData, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onFetchData()
  }

  return (
    <div className="sheet-config">
      <h2>Configuration Google Sheet</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="sheet-url">URL du Google Sheet:</label>
          <input
            id="sheet-url"
            type="url"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Chargement...' : 'Charger les données'}
        </button>
      </form>
      <p className="info-text">
        Note: Assurez-vous que le Google Sheet est publié sur le web ou que les permissions sont configurées correctement.
      </p>
    </div>
  )
}

export default SheetConfig