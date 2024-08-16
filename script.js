document.addEventListener("DOMContentLoaded", function() {
  fetchData();
});

async function fetchData() {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbxOIuuOUHq_lSA9ifz5YW8RdEGSlF5_DYzZ5rzgM0PTx09n4JqfGaYvJ8EVUxFOqHdP/exec');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    localStorage.setItem('sheetData', JSON.stringify(result));
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

  const mergeMap = {};
  data.mergedCells.forEach(cell => {
    for (let i = 0; i < cell.numRows; i++) {
      for (let j = 0; j < cell.numColumns; j++) {
        const key = `${cell.row + i}-${cell.column + j}`;
        mergeMap[key] = { masterRow: cell.row, masterColumn: cell.column };
      }
    }
  });

  data.tableData.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    row.forEach((cellData, colIndex) => {
      const cellKey = `${rowIndex + 1}-${colIndex + 1}`;
      const mergeInfo = mergeMap[cellKey];
      if (!mergeInfo || (mergeInfo.masterRow === rowIndex + 1 && mergeInfo.masterColumn === colIndex + 1)) {
        const td = document.createElement('td');

        // 객체인 경우 JSON 문자열로 변환하여 표시
        if (typeof cellData === 'object') {
          td.innerHTML = JSON.stringify(cellData);
        } else {
          td.innerHTML = cellData;
        }
        
        applyStyles(td, rowIndex, colIndex, data);

        if (mergeInfo) {
          td.rowSpan = data.mergedCells.find(cell => cell.row === mergeInfo.masterRow && cell.column === mergeInfo.masterColumn).numRows;
          td.colSpan = data.mergedCells.find(cell => cell.row === mergeInfo.masterRow && cell.column === mergeInfo.masterColumn).numColumns;
        }
        tr.appendChild(td);
      }
    });
    table.appendChild(tr);
  });
}

function applyStyles(td, rowIndex, colIndex, data) {
  td.style.backgroundColor = data.backgrounds[rowIndex][colIndex] || '';
  td.style.color = data.fontColors[rowIndex][colIndex] || '';
  td.style.textAlign = data.horizontalAlignments[rowIndex][colIndex] || 'left';
  td.style.verticalAlign = data.verticalAlignments[rowIndex][colIndex] || 'top';
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
