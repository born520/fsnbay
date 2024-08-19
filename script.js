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

  const totalWidth = data.columnWidths.reduce((acc, width) => acc + width, 0);
  const columnWidths = data.columnWidths.map(width => (width / totalWidth) * 100); // 비율로 변환

  data.tableData.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    
    // 행 높이 적용
    if (data.rowHeights[rowIndex]) {
      tr.style.height = data.rowHeights[rowIndex] + 'px';
    }

    row.forEach((cellData, colIndex) => {
      const td = document.createElement('td');

      if (typeof cellData === 'object') {
        td.innerHTML = cellData.text || JSON.stringify(cellData);
      } else {
        td.innerHTML = cellData;
      }

      applyStyles(td, rowIndex, colIndex, data);

      // 열 너비 비율 적용
      td.style.width = columnWidths[colIndex] + '%';

      // 텍스트 줄 바꿈 허용
      td.style.whiteSpace = 'pre-wrap';
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
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
