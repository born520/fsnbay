async function fetchData() {
  try {
    // 기존에 서버에서 데이터를 가져오는 부분이 있었다면 여기에 포함되었을 것입니다.
    // 이 부분을 제거하거나 유지하고, 대신 정적 데이터를 먼저 로드합니다.

    // 정적 데이터 로드
    renderTable(tableData, true); // data.js 파일에서 로드된 정적 데이터 사용

    // 기존의 서버 요청을 그대로 유지할 수 있습니다.
    // 예시: 서버에서 전체 데이터를 비동기적으로 가져오기
    const response = await fetch('https://script.google.com/macros/s/AKfycbwJh55eAwKMubOUmq0N0NtIZ83N4EthpC4hC_QNKwpx2vF8PyLrm05ffwgLYfTSxSA/exec');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Full data fetched successfully');

    // 서버에서 가져온 전체 데이터를 다시 렌더링
    renderTable(result, true);
    localStorage.setItem('cachedTableData', JSON.stringify(result)); // 데이터를 로컬 저장소에 캐시
    localStorage.setItem('dataHash', hashData(result.tableData)); // 데이터 해시값 저장

  } catch (error) {
    console.error('Error fetching data:', error);
    document.getElementById('data-table').innerHTML = "<tr><td>Error fetching data. Please try again later.</td></tr>";
  }
}

function renderTable(data, isUpdate) {
  if (data.error) {
    console.error('Error in data:', data.error);
    document.getElementById('data-table').innerHTML = "<tr><td>Error in data</td></tr>";
    return;
  }

  if (isUpdate) {
    const table = document.getElementById('data-table');
    table.innerHTML = ''; // 기존 테이블 내용 지우기
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

// 페이지가 로드될 때 데이터를 가져옴
document.addEventListener('DOMContentLoaded', fetchData);
