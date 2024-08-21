async function fetchData() {
  try {
    // 로컬 스토리지에서 캐시된 데이터를 가져오기
    const cachedData = localStorage.getItem('cachedTableData');
    if (cachedData) {
      renderTable(JSON.parse(cachedData), false);
      document.getElementById('loading-indicator').style.display = 'none';
      document.getElementById('data-table').style.display = '';
    }

    // Google Sheets 데이터를 비동기적으로 가져오기
    const response = await fetch('https://script.google.com/macros/s/AKfycbwJh55eAwKMubOUmq0N0NtIZ83N4EthpC4hC_QNKwpx2vF8PyLrm05ffwgLYfTSxSA/exec');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    // 데이터 변경 여부 확인 후 업데이트
    const currentHash = hashData(result.tableData);
    const previousHash = localStorage.getItem('dataHash');
    if (currentHash !== previousHash) {
      renderTable(result, true);
      localStorage.setItem('cachedTableData', JSON.stringify(result));
      localStorage.setItem('dataHash', currentHash);
    }

    document.getElementById('loading-indicator').style.display = 'none';
    document.getElementById('data-table').style.display = '';
  } catch (error) {
    console.error('Error fetching data:', error);
    document.getElementById('data-table').innerHTML = "<tr><td>Error fetching data. Please try again later.</td></tr>";
  }
}

function hashData(data) {
  return JSON.stringify(data).length;
}

function renderTable(data, isUpdate) {
  if (data.error) {
    console.error('Error in data:', data.error);
    document.getElementById('data-table').innerHTML = "<tr><td>Error in data</td></tr>";
    return;
  }

  if (isUpdate) {
    const table = document.getElementById('data-table');
    table.innerHTML = '';
  }

  const fragment = document.createDocumentFragment();
  const columnWidths = data.columnWidths || [];

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

    if (data.rowHeights && data.rowHeights[rowIndex]) {
      tr.style.height = data.rowHeights[rowIndex] + 'px';
    }

    row.forEach((cellData, colIndex) => {
      const cellKey = `${rowIndex + 1}-${colIndex + 1}`;
      const mergeInfo = mergeMap[cellKey];

      if (!mergeInfo || (mergeInfo.masterRow === rowIndex + 1 && mergeInfo.masterColumn === colIndex + 1)) {
        const td = document.createElement('td');

        if (typeof cellData === 'object') {
          td.innerHTML = cellData.richText || cellData.text || '';
        } else {
          td.innerHTML = cellData;
        }

        applyStyles(td, rowIndex, colIndex, data);

        if (data.columnWidths && data.columnWidths[colIndex]) {
          td.style.width = data.columnWidths[colIndex] + 'px';
        }

        if (mergeInfo) {
          const mergedCell = data.mergedCells.find(cell => cell.row === mergeInfo.masterRow && cell.column === mergeInfo.masterColumn);
          if (mergedCell) {
            td.rowSpan = mergedCell.numRows;
            td.colSpan = mergedCell.numColumns;
          }
        }

        td.style.whiteSpace = 'pre-wrap';
        tr.appendChild(td);
      }
    });

    fragment.appendChild(tr);
  });

  document.getElementById('data-table').appendChild(fragment);
}

function applyStyles(td, rowIndex, colIndex, data) {
  td.style.backgroundColor = data.backgrounds[rowIndex][colIndex] || '';
  td.style.color = data.fontColors[rowIndex][colIndex] || '';
  td.style.textAlign = data.horizontalAlignments[rowIndex][colIndex] || 'center';
  td.style.verticalAlign = data.verticalAlignments[rowIndex][colIndex] || 'middle';
  td.style.fontWeight = data.fontWeights[rowIndex][colIndex] || 'normal';
  td.style.fontSize = (data.fontSizes[rowIndex][colIndex] || 12) + 'px';
}

document.addEventListener('DOMContentLoaded', fetchData);
