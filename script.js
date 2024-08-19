async function fetchData() {
  try {
    const cachedData = localStorage.getItem('cachedTableData');
    if (cachedData) {
      renderTable(JSON.parse(cachedData), false);
    }

    const response = await fetch('https://script.google.com/macros/s/AKfycbwJh55eAwKMubOUmq0N0NtIZ83N4EthpC4hC_QNKwpx2vF8PyLrm05ffwgLYfTSxSA/exec');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    
    const oldHash = localStorage.getItem('dataHash');
    const newHash = hashData(result.tableData);

    if (newHash !== oldHash) {
      renderTable(result, true);
      localStorage.setItem('cachedTableData', JSON.stringify(result));
      localStorage.setItem('dataHash', newHash);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function hashData(data) {
  return JSON.stringify(data).length;
}

function renderTable(data, isUpdate) {
  if (data.error) {
    console.error('Error in data:', data.error);
    return;
  }

  if (isUpdate) {
    const table = document.getElementById('data-table');
    table.innerHTML = '';
  }

  const fragment = document.createDocumentFragment();
  const columnWidths = data.columnWidths || [];

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

      if (columnWidths[colIndex]) {
        td.style.width = columnWidths[colIndex] + 'px';
      }

      td.style.whiteSpace = 'pre-wrap';
      tr.appendChild(td);
    });

    fragment.appendChild(tr);
  });

  document.getElementById('data-table').appendChild(fragment);
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
