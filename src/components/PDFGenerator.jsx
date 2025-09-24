import React, { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const PDFGenerator = ({ data, selectedIndices }) => {
  const [generating, setGenerating] = useState(false)
  const [config, setConfig] = useState({
    priceDisplay: 'both' // 'boutique', 'pro', 'both'
  })

  const formatDescription = (description) => {
    if (!description) return ''
    return description
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        // Enlever le tiret s'il y en a déjà un au début
        const cleanLine = line.replace(/^-\s*/, '')
        // Ajouter un tiret au début de chaque ligne
        return `- ${cleanLine}`
      })
      .join('<br/>')
  }

  const generatePDF = async () => {
    setGenerating(true)

    try {
      const selectedData = data
        .filter((_, index) => selectedIndices.includes(index))
        .filter(item => {
          // Filtrer les lignes qui ont au moins un titre et une image
          const imageField = Object.keys(item).find(key => key.toLowerCase().includes('image'))
          const nomField = Object.keys(item).find(key => key.toLowerCase().includes('nom') || key.toLowerCase().includes('produit'))

          // Vérifier que la ligne a un titre et une image non vides
          return (nomField && item[nomField] && item[nomField].trim()) &&
                 (imageField && item[imageField] && item[imageField].trim())
        })

      if (selectedData.length === 0) {
        alert('Veuillez sélectionner au moins un produit')
        setGenerating(false)
        return
      }

      // Diviser les données en pages de 5 produits
      const itemsPerPage = 5
      const pages = []
      for (let i = 0; i < selectedData.length; i += itemsPerPage) {
        pages.push(selectedData.slice(i, i + itemsPerPage))
      }

      const element = document.createElement('div')
      element.style.width = '210mm'
      element.style.backgroundColor = 'white'

      element.innerHTML = `
        <style>
          @import url('/Poppins-Regular.ttf');
          @import url('/Poppins-Bold.ttf');

          @font-face {
            font-family: 'Poppins';
            src: url('/Poppins-Regular.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }

          @font-face {
            font-family: 'Poppins';
            src: url('/Poppins-Bold.ttf') format('truetype');
            font-weight: 700;
            font-style: normal;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 10mm 10mm;
            page-break-after: always;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            position: relative;
          }

          .page:last-child {
            page-break-after: auto;
          }
        </style>
        ${pages.map((pageItems, pageIndex) => `
          <div class="page">
            <div style="display: flex; flex-direction: column; gap: 10mm; width: 100%; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              ${pageItems.map(item => {
            const imageField = Object.keys(item).find(key => key.toLowerCase().includes('image'))
            const nomField = Object.keys(item).find(key => key.toLowerCase().includes('nom') || key.toLowerCase().includes('produit'))
            const descField = Object.keys(item).find(key => key.toLowerCase().includes('description'))
            const prixBoutiqueField = Object.keys(item).find(key => key.toLowerCase().includes('prix') && key.toLowerCase().includes('boutique'))
            const prixProField = Object.keys(item).find(key => key.toLowerCase().includes('prix') && key.toLowerCase().includes('pro'))

            return `
              <div style="width: 100%; display: flex; gap: 10px; min-height: 40mm; page-break-inside: avoid; box-sizing: border-box; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 8px 0;">
                ${imageField && item[imageField] ? `
                  <div style="flex-shrink: 0; width: 60mm; height: 40mm; overflow: hidden; border-radius: 8px; background: #f5f5f5;">
                    <img src="${item[imageField]}" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>` :
                  `<div style="flex-shrink: 0; width: 60mm; height: 40mm; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999;">
                    <span style="font-size: 11px; font-family: 'Poppins', sans-serif;">Pas d'image</span>
                  </div>`
                }
                <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 0px;">
                  <h3 style="margin: 0 0 8px 0; color: #D6BA6B; font-size: 18px; font-weight: 700; line-height: 1.2; font-family: 'Poppins', sans-serif;">${item[nomField] || item['Nom Produit'] || 'Sans nom'}</h3>
                  ${descField && item[descField] ?
                    `<p style="color: #5a5a5a; font-size: 12px; line-height: 1.4; margin: 5px 0; font-family: 'Poppins', sans-serif; font-weight: 400;">${formatDescription(item[descField])}</p>` :
                    ''
                  }
                </div>
                ${(config.priceDisplay !== 'none' && (prixBoutiqueField || prixProField)) ?
                  `<div style="flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; text-align: right; padding-right: 10px; min-width: 40mm;">
                    ${(config.priceDisplay === 'boutique' || config.priceDisplay === 'both') && prixBoutiqueField && item[prixBoutiqueField] ?
                      `<p style="margin: 0; font-size: 11px; color: #D6BA6B; font-family: 'Poppins', sans-serif;">Prix boutique</p>
                      <p style="margin: 2px 0 8px 0; font-weight: 700; color: #D6BA6B; font-size: 15px; font-family: 'Poppins', sans-serif;">${item[prixBoutiqueField]}</p>` :
                      ''
                    }
                    ${(config.priceDisplay === 'pro' || config.priceDisplay === 'both') && prixProField && item[prixProField] ?
                      `<p style="margin: 0; font-size: 11px; color: #D6BA6B; font-family: 'Poppins', sans-serif;">Prix Pro</p>
                      <p style="margin: 2px 0; font-weight: 700; color: #D6BA6B; font-size: 15px; font-family: 'Poppins', sans-serif;">${item[prixProField]}</p>` :
                      ''
                    }
                  </div>` :
                  ''
                }
              </div>
            `
              }).join('')}
            </div>
            <div style="position: absolute; bottom: 15mm; left: 15mm; right: 15mm; display: flex; justify-content: space-between; align-items: center; font-family: 'Poppins', sans-serif; font-size: 10px; color: #999;">
              <span>@audecreativestuff</span>
              <span>www.audecreativestuff.com</span>
            </div>
          </div>
        `).join('')}
      `

      document.body.appendChild(element)

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      })

      document.body.removeChild(element)

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save('catalogue.pdf')
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Erreur lors de la génération du PDF: ' + error.message)
    }

    setGenerating(false)
  }

  const selectedCount = selectedIndices ? selectedIndices.length : 0

  return (
    <div className="pdf-generator">
      <h2>Générer le PDF</h2>
      {selectedCount === 0 && (
        <div className="warning-message">
          Aucun produit sélectionné. Veuillez sélectionner au moins un produit pour générer le PDF.
        </div>
      )}
      {selectedCount > 0 && (
        <div className="selected-info">
          {selectedCount} produit{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''} pour le catalogue
        </div>
      )}

      <div className="pdf-config">
        <div className="form-group">
          <label htmlFor="price-display">Affichage des prix:</label>
          <select
            id="price-display"
            value={config.priceDisplay}
            onChange={(e) => setConfig({...config, priceDisplay: e.target.value})}
          >
            <option value="both">Prix boutique et Pro</option>
            <option value="boutique">Prix boutique uniquement</option>
            <option value="pro">Prix Pro uniquement</option>
            <option value="none">Aucun prix</option>
          </select>
        </div>
      </div>

      <div className="pdf-actions">
        <button
          onClick={generatePDF}
          disabled={generating || !data || data.length === 0 || selectedCount === 0}
          className="btn-primary"
        >
          {generating ? 'Génération en cours...' : 'Générer le catalogue PDF'}
        </button>
      </div>
    </div>
  )
}

export default PDFGenerator