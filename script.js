// 페이지가 로드될 때 실행되는 JavaScript 코드
document.addEventListener('DOMContentLoaded', function() {
  console.log("JavaScript is loaded and running."); // 스크립트가 실행되는지 확인

  // JavaScript가 제대로 로드되었는지 테스트하기 위한 간단한 로그 추가
  const table = document.getElementById('data-table');
  if (table) {
    console.log("Table element found.");
    table.innerHTML = "<tr><td>Table should be visible now</td></tr>";
  } else {
    console.log("Table element not found.");
  }
});
