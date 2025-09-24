import axios from 'axios'

export const fetchSheetData = async (sheetUrl) => {
  try {
    const spreadsheetId = extractSpreadsheetId(sheetUrl)

    if (!spreadsheetId) {
      throw new Error('URL Google Sheet invalide')
    }

    const sheetName = extractSheetName(sheetUrl) || 'Sheet1'

    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`

    const response = await axios.get(csvUrl, {
      responseType: 'text'
    })

    const data = parseCSV(response.data)

    if (data.length === 0) {
      throw new Error('Aucune donnée trouvée dans le Google Sheet')
    }

    return data
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error)

    if (error.response?.status === 404) {
      throw new Error('Google Sheet introuvable. Vérifiez l\'URL et les permissions.')
    } else if (error.response?.status === 403) {
      throw new Error('Accès refusé. Assurez-vous que le Google Sheet est public ou partagé.')
    } else if (error.message) {
      throw error
    } else {
      throw new Error('Impossible de récupérer les données du Google Sheet')
    }
  }
}

const extractSpreadsheetId = (url) => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

const extractSheetName = (url) => {
  const gidMatch = url.match(/[#&]gid=([0-9]+)/)

  if (gidMatch) {
    return null
  }

  const sheetMatch = url.match(/[#&]sheet=([^&#]+)/)
  return sheetMatch ? decodeURIComponent(sheetMatch[1]) : null
}

const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n')

  if (lines.length < 2) {
    return []
  }

  const headers = parseCSVLine(lines[0])

  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])

    if (values.length === headers.length) {
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      data.push(row)
    }
  }

  return data
}

const parseCSVLine = (line) => {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"'
      i++
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())

  return result.map(value => {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1).replace(/""/g, '"')
    }
    return value
  })
}