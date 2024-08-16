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
    
    // 행 높이 적용
    tr.style.height = data.rowHeights[rowIndex] + 'px';

    row.forEach((cellData, colIndex) => {
      const cellKey = `${rowIndex + 1}-${colIndex + 1}`;
      const mergeInfo = mergeMap[cellKey];
      if (!mergeInfo || (mergeInfo.masterRow === rowIndex + 1 && mergeInfo.masterColumn === colIndex + 1)) {
        const td = document.createElement('td');

        // 객체인 경우 특정 속성을 추출하여 표시
        if (typeof cellData === 'object') {
          td.innerHTML = cellData.text || JSON.stringify(cellData);
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
