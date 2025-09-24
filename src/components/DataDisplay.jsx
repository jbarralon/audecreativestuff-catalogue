import React, { useState, useEffect } from 'react'

const DataDisplay = ({ data, onSelectionChange }) => {
  const [previewMode, setPreviewMode] = useState('table')
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const itemsPerPage = 10

  const formatDescription = (description) => {
    if (!description) return ''
    // Diviser par lignes et retirer les tirets au début de chaque ligne
    return description
      .split('\n')
      .map(line => line.replace(/^-\s*/, ''))
      .filter(line => line.trim())
      .join(' • ')
  }

  useEffect(() => {
    if (data) {
      const allIndices = new Set(data.map((_, index) => index))
      setSelectedItems(allIndices)
      if (onSelectionChange) {
        onSelectionChange(Array.from(allIndices))
      }
    }
  }, [data])

  if (!data || data.length === 0) {
    return <div>Aucune donnée à afficher</div>
  }

  const headers = Object.keys(data[0])

  // Extraire les catégories uniques
  const categoryField = headers.find(h => h.toLowerCase().includes('catégorie') || h.toLowerCase().includes('categorie'))
  const categories = categoryField
    ? ['all', ...new Set(data.map(item => item[categoryField]).filter(Boolean))]
    : ['all']

  // Filtrer les données
  const filteredData = data.filter(item => {
    // Filtre par catégorie
    if (selectedCategory !== 'all' && categoryField && item[categoryField] !== selectedCategory) {
      return false
    }

    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return Object.values(item).some(value =>
        value && value.toString().toLowerCase().includes(search)
      )
    }

    return true
  })

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  // Calcul pour la pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const toggleSelection = (index) => {
    const actualIndex = startIndex + index
    const newSelection = new Set(selectedItems)
    if (newSelection.has(actualIndex)) {
      newSelection.delete(actualIndex)
    } else {
      newSelection.add(actualIndex)
    }
    setSelectedItems(newSelection)
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection))
    }
  }

  const isItemSelected = (index) => {
    const actualIndex = startIndex + index
    return selectedItems.has(actualIndex)
  }

  const areAllPageItemsSelected = () => {
    for (let i = 0; i < currentData.length; i++) {
      if (!selectedItems.has(startIndex + i)) {
        return false
      }
    }
    return currentData.length > 0
  }

  const togglePageSelection = () => {
    const newSelection = new Set(selectedItems)
    const allSelected = areAllPageItemsSelected()

    for (let i = 0; i < currentData.length; i++) {
      const actualIndex = startIndex + i
      if (allSelected) {
        newSelection.delete(actualIndex)
      } else {
        newSelection.add(actualIndex)
      }
    }

    setSelectedItems(newSelection)
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection))
    }
  }

  const toggleAllSelection = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set())
      if (onSelectionChange) {
        onSelectionChange([])
      }
    } else {
      const allIndices = new Set(data.map((_, index) => index))
      setSelectedItems(allIndices)
      if (onSelectionChange) {
        onSelectionChange(Array.from(allIndices))
      }
    }
  }

  return (
    <div className="data-display">
      <h2>Aperçu des données</h2>

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search"
              title="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>

        {categories.length > 1 && (
          <div className="category-filter">
            <label htmlFor="category-select">Catégorie:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Toutes les catégories' : cat}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="preview-controls">
          <button
            onClick={() => setPreviewMode('table')}
            className={previewMode === 'table' ? 'active' : ''}
          >
            Vue Table
          </button>
          <button
            onClick={() => setPreviewMode('cards')}
            className={previewMode === 'cards' ? 'active' : ''}
          >
            Vue Cartes
          </button>
        </div>
      </div>

      <div className="data-info">
        <p>
          {filteredData.length} produit{filteredData.length > 1 ? 's' : ''} trouvé{filteredData.length > 1 ? 's' : ''}
          {searchTerm || selectedCategory !== 'all' ? ` (sur ${data.length} total)` : ''}
          {' | '}
          {selectedItems.size} sélectionné{selectedItems.size > 1 ? 's' : ''}
        </p>
        <button onClick={toggleAllSelection} className="btn-select-all">
          {selectedItems.size === data.length ? 'Désélectionner tout' : 'Sélectionner tout'}
        </button>
      </div>

      {previewMode === 'table' ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{width: '40px'}}>
                  <input
                    type="checkbox"
                    checked={areAllPageItemsSelected()}
                    onChange={togglePageSelection}
                  />
                </th>
                {headers.map((header) => {
                  const isPriceColumn = header.toLowerCase().includes('prix')
                  return (
                    <th key={header} style={isPriceColumn ? {width: '75px'} : {}}>
                      {header}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => (
                <tr key={index} className={isItemSelected(index) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isItemSelected(index)}
                      onChange={() => toggleSelection(index)}
                    />
                  </td>
                  {headers.map((header) => {
                    const isPriceColumn = header.toLowerCase().includes('prix')
                    return (
                      <td key={header} style={isPriceColumn ? {width: '75px', whiteSpace: 'nowrap'} : {}}>
                        {header.toLowerCase().includes('image') && row[header] ? (
                          <img src={row[header]} alt="Product" style={{maxWidth: '100px'}} />
                        ) : header.toLowerCase().includes('description') ? (
                          <span title={row[header]}>{formatDescription(row[header])}</span>
                        ) : (
                          row[header]
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ««
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                «
              </button>

              <span className="pagination-info">
                Page {currentPage} sur {totalPages} ({startIndex + 1}-{Math.min(endIndex, filteredData.length)} sur {filteredData.length} produits)
              </span>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                »
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                »»
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="cards-container">
          {currentData.map((item, index) => {
            const imageField = Object.keys(item).find(key => key.toLowerCase().includes('image'))
            const nomField = Object.keys(item).find(key => key.toLowerCase().includes('nom') || key.toLowerCase().includes('produit'))
            const descField = Object.keys(item).find(key => key.toLowerCase().includes('description'))
            const prixField = Object.keys(item).find(key => key.toLowerCase().includes('prix'))

            return (
              <div key={index} className={`product-card ${isItemSelected(index) ? 'selected' : ''}`}>
                <div className="card-selection">
                  <input
                    type="checkbox"
                    checked={isItemSelected(index)}
                    onChange={() => toggleSelection(index)}
                  />
                </div>
                {imageField && item[imageField] && (
                  <img src={item[imageField]} alt={item[nomField] || 'Product'} />
                )}
                <h3>{item[nomField] || item['Nom Produit'] || 'Sans nom'}</h3>
                <p className="description">{formatDescription(item[descField])}</p>
                {prixField && <p className="price">{item[prixField] || ''}</p>}
              </div>
            )
          })}
          {totalPages > 1 && (
            <div className="pagination" style={{marginTop: '1rem'}}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ««
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                «
              </button>
              <span className="pagination-info">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                »
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                »»
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DataDisplay