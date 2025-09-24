export const parseCSV = (csvText) => {
  const rows = []
  let currentRow = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField)
      currentField = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row
      if (char === '\r' && nextChar === '\n') {
        i++ // Skip \n in \r\n
      }
      if (currentRow.length > 0 || currentField) {
        currentRow.push(currentField)
        rows.push(currentRow)
        currentRow = []
        currentField = ''
      }
    } else {
      // Regular character
      currentField += char
    }
  }

  // Don't forget the last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    rows.push(currentRow)
  }

  if (rows.length < 2) {
    return []
  }

  const headers = rows[0]
  const data = []

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i]
    if (values.length === headers.length) {
      // Vérifier que la ligne n'est pas vide (au moins une valeur non vide)
      const hasContent = values.some(val => val && val.trim() !== '')

      if (hasContent) {
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index]
        })

        // Vérifier que la ligne a un titre ET une image
        const imageField = Object.keys(row).find(key => key.toLowerCase().includes('image'))
        const nomField = Object.keys(row).find(key => key.toLowerCase().includes('nom') || key.toLowerCase().includes('produit'))

        // N'ajouter que si la ligne a un titre et une image non vides
        if ((nomField && row[nomField] && row[nomField].trim()) &&
            (imageField && row[imageField] && row[imageField].trim())) {
          data.push(row)
        }
      }
    }
  }

  return data
}

export const loadCSVFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const csvText = e.target.result
        const data = parseCSV(csvText)

        if (data.length === 0) {
          reject(new Error('Aucune donnée trouvée dans le fichier CSV'))
        } else {
          resolve(data)
        }
      } catch (error) {
        reject(new Error('Erreur lors du parsing du CSV: ' + error.message))
      }
    }

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'))
    }

    reader.readAsText(file)
  })
}

export const loadDefaultCSV = async () => {
  try {
    const response = await fetch('/catalogue.csv')

    if (!response.ok) {
      throw new Error('Impossible de charger le fichier CSV par défaut')
    }

    const csvText = await response.text()
    const data = parseCSV(csvText)

    if (data.length === 0) {
      throw new Error('Aucune donnée trouvée dans le fichier CSV par défaut')
    }

    return data
  } catch (error) {
    console.error('Erreur lors du chargement du CSV par défaut:', error)
    throw error
  }
}