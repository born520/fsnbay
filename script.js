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
    document.getElementById('data-table').innerHTML = "<tr><td>Error fetching data</td></tr>";
  }
}

function renderTable(data) {
  if (data.error) {
    console.error('Error in data:', data.error);
    document.getElementById('data-table').innerHTML = "<tr><td>Error in data</td></tr>";
    return;
  }

  const table = document.getElementById('data-table');
  table.innerHTML = ''; // 기존 테이블 내용 지우기

  const fragment = document.createDocumentFragment();

  const mergeMap = {};
  if (data.mergedCells) {
    data.mergedCells.forEach(cell => {
      for (let i = 0; i < cell.numRows; i++) {
        for (let j = 0; j < cell.numColumns; j++) {
          const key = `${cell.row + i}-${cell.column + j}`;
          mergeMap[key] = { masterRow: cell.row, masterColumn: cell.column };
        }
      }
    });
  }

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

        tr.appendChild(td);
      }
    });

    fragment.appendChild(tr);
  });

  table.appendChild(fragment); // 테이블에 새로 생성된 내용 추가
}

function applyStyles(td, rowIndex, colIndex, data) {
  td.style.backgroundColor = data.backgrounds[rowIndex][colIndex] || '';
  td.style.color = data.fontColors[rowIndex][colIndex] || '';
  td.style.textAlign = data.horizontalAlignments[rowIndex][colIndex] || 'center';
  td.style.verticalAlign = data.verticalAlignments[rowIndex][colIndex] || 'middle';
  td.style.fontWeight = data.fontWeights[rowIndex][colIndex] || 'normal';
  td.style.fontSize = (data.fontSizes[rowIndex][colIndex] || 12) + 'px';
}

// 페이지가 로드될 때 데이터를 가져옴
document.addEventListener('DOMContentLoaded', fetchData);
