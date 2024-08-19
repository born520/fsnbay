async function fetchData() {
  try {
    // GitHub에서 초기 JSON 데이터 가져오기
    const initialDataResponse = await fetch('https://raw.githubusercontent.com/born520/fsnbay/main/initial_data.json');
    if (!initialDataResponse.ok) {
      throw new Error('Failed to load initial data');
    }
    const initialData = await initialDataResponse.json();
    console.log('Initial data loaded from GitHub');
    renderTable(initialData, true);

    // 서버에서 전체 데이터를 비동기적으로 가져오기
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error('Request timed out after 20 seconds');
    }, 20000); // 20초로 타임아웃 설정

    const response = await fetch('https://script.google.com/macros/s/AKfycbwJh55eAwKMubOUmq0N0NtIZ83N4EthpC4hC_QNKwpx2vF8PyLrm05ffwgLYfTSxSA/exec', {
      signal: controller.signal
    });

    clearTimeout(timeoutId); // 요청이 완료되면 타임아웃 제거

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Full data fetched successfully');

    renderTable(result, true);
    localStorage.setItem('cachedTableData', JSON.stringify(result)); // 데이터를 로컬 저장소에 캐시
    localStorage.setItem('dataHash', hashData(result.tableData)); // 데이터 해시값 저장
  } catch (error) {
    console.error('Error fetching data:', error);
    if (error.name === 'AbortError') {
      document.getElementById('data-table').innerHTML = "<tr><td>Request timed out. Please try again later.</td></tr>";
    } else {
      document.getElementById('data-table').innerHTML = "<tr><td>Error fetching data. Please try again later.</td></tr>";
    }
  }
}
