async function fetchData() {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbwJh55eAwKMubOUmq0N0NtIZ83N4EthpC4hC_QNKwpx2vF8PyLrm05ffwgLYfTSxSA/exec');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    renderTable(result);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function renderTable(data) {
  if (data.error) {
    console.error('Error in data:', data.error);
    return;
  }

  const table = document.getElementById('data-table');
  table.innerHTML = '';

  const columnWidths = data.columnWidths || [];
  
  if (columnWidths.length > 0) {
    const totalWidth = columnWidths.reduce((acc, width) => acc + width, 0);
    const columnWidthPercentages = columnWidths.map(width => (width / totalWidth) * 100);

    data.tableData.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');

      if (data.rowHeights && data.rowHeights[rowIndex]) {
        tr.style.height = data.rowHeights[rowIndex] + 'px';
      }

      row.forEach((cellData, colIndex) => {
        const td = document.createElement('td');

        if (typeof cellData === 'object') {
          // JSON 형식으로 표시되지 않도록 데이터의 텍스트 값을 추출하여 표시
          td.innerHTML = cellData.richText || cellData.text || '';
        } else {
          td.innerHTML = cellData;
        }

        applyStyles(td, rowIndex, colIndex, data);

        if (columnWidthPercentages[colIndex]) {
          td.style.width = columnWidthPercentages[colIndex] + '%';
        }

        td.style.whiteSpace = 'pre-wrap';
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  } else {
    data.tableData.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');

      if (data.rowHeights && data.rowHeights[rowIndex]) {
        tr.style.height = data.rowHeights[rowIndex] + 'px';
      }

      row.forEach((cellData, colIndex) => {
        const td = document.createElement('td');

        if (typeof cellData === 'object') {
          td.innerHTML = cellData.richText || cellData.text || '';
        } else {
          td.innerHTML = cellData;
        }

        applyStyles(td, rowIndex, colIndex, data);

        td.style.whiteSpace = 'pre-wrap';
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  }
}

function applyStyles(td, rowIndex, colIndex, data) {
  td.style.backgroundColor = data.backgrounds[rowIndex][colIndex] || '';
  td.style.color = data.fontColors[rowIndex][colIndex] || '';
  td.style.textAlign = data.horizontalAlignments[rowIndex][colIndex] || 'left';  // 가로 정렬
  td.style.verticalAlign = data.verticalAlignments[rowIndex][colIndex] || 'top'; // 세로 정렬
  td.style.fontWeight = data.fontWeights[rowIndex][colIndex] || 'normal';
  td.style.fontSize = (data.fontSizes[rowIndex][colIndex] || 12) + 'px';

  if (data.fontStyles[rowIndex][colIndex].includes('strikethrough')) {
    td.classList.add('strikethrough');
  }

  applyBorderStyles(td);
}

function applyBorderStyles(td) {
  td.style.border = '1px solid black';
}
