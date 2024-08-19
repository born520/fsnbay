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

  data.tableData.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');

    row.forEach((cellData, colIndex) => {
      const td = document.createElement('td');
      td.innerHTML = cellData.text || ''; // 셀 내용 채우기

      // 원본 스프레드시트의 셀 너비와 기타 스타일 반영
      if (data.columnWidths && data.columnWidths[colIndex]) {
        td.style.width = data.columnWidths[colIndex] + 'px'; // 셀 너비 설정
      }

      if (data.fontSizes && data.fontSizes[rowIndex] && data.fontSizes[rowIndex][colIndex]) {
        td.style.fontSize = data.fontSizes[rowIndex][colIndex] + 'px'; // 글자 크기 설정
      }

      if (data.fontColors && data.fontColors[rowIndex] && data.fontColors[rowIndex][colIndex]) {
        td.style.color = data.fontColors[rowIndex][colIndex]; // 글자 색상 설정
      }

      if (data.backgroundColors && data.backgroundColors[rowIndex] && data.backgroundColors[rowIndex][colIndex]) {
        td.style.backgroundColor = data.backgroundColors[rowIndex][colIndex]; // 배경 색상 설정
      }

      tr.appendChild(td);
    });

    fragment.appendChild(tr);
  });

  table.appendChild(fragment); // 테이블에 새로 생성된 내용 추가
}

// 페이지가 로드될 때 데이터를 가져옴
document.addEventListener('DOMContentLoaded', fetchData);
