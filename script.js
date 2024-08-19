async function fetchData() {
  try {
    const cachedData = localStorage.getItem('cachedTableData');
    if (cachedData) {
      console.log('Using cached data');
      renderTable(JSON.parse(cachedData), false); // 캐시된 데이터를 먼저 렌더링
    }

    // 요청에 타임아웃 설정 (20초 후 요청 중단)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error('Request timed out after 20 seconds');
    }, 20000); // 20초로 타임아웃 시간 설정

    const response = await fetch('https://script.google.com/macros/s/AKfycbwJh55eAwKMubOUmq0N0NtIZ83N4EthpC4hC_QNKwpx2vF8PyLrm05ffwgLYfTSxSA/exec', {
      signal: controller.signal
    });

    clearTimeout(timeoutId); // 요청이 완료되면 타임아웃 제거

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Data fetched successfully');

    // 중요한 데이터(2줄)만 먼저 렌더링
    renderPartialTable(result, 2);

    // 나머지 데이터를 비동기적으로 로드
    setTimeout(() => {
      renderTable(result, true);
      localStorage.setItem('cachedTableData', JSON.stringify(result)); // 데이터를 로컬 저장소에 캐시
      localStorage.setItem('dataHash', hashData(result.tableData)); // 데이터 해시값 저장
      console.log('Full data rendered and cached');
    }, 100);
  } catch (error) {
    console.error('Error fetching data:', error);
    if (error.name === 'AbortError') {
      document.getElementById('data-table').innerHTML = "<tr><td>Request timed out. Please try again later.</td></tr>";
    } else {
      document.getElementById('data-table').innerHTML = "<tr><td>Error fetching data. Please try again later.</td></tr>";
    }
  }
}

function renderPartialTable(data, numRows) {
  const table = document.getElementById('data-table');
  table.innerHTML = ''; // 기존 테이블 내용 지우기

  // 중요한 데이터만 렌더링 (예: 첫 2개 행)
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < Math.min(numRows, data.tableData.length); i++) {
    const tr = document.createElement('tr');
    data.tableData[i].forEach(cellData => {
      const td = document.createElement('td');
      td.textContent = cellData.text || cellData.richText || '';
      tr.appendChild(td);
    });
    fragment.appendChild(tr);
  }
  table.appendChild(fragment);
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
