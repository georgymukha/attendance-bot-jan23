async function main() {
  let data = await getData();
  console.log(data);
  data.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${row.firstName}</td>
      <td>${row.lastName}</td>
      <td>${row.attendance}</td>
    `;
    document.getElementById("data-body").appendChild(tr);
  });
}
function filterByDate() {
  const dateFilter = document.getElementById("date-filter").value;
  const rows = document.getElementById("data-body").rows;
  for (let i = 0; i < rows.length; i++) {
    const date = rows[i].cells[0].innerHTML;
    if (date !== dateFilter) {
      rows[i].style.display = "none";
    } else {
      rows[i].style.display = "";
    }
  }
}

function sortTable(n) {
  const table = document.getElementById("data-table");
  const rows = table.rows;
  const switching = true;
  let shouldSwitch = false;
  let dir = "asc";
  while (switching) {
    switching = false;
    for (let i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      const x = rows[i].getElementsByTagName("TD")[n];
      const y = rows[i + 1].getElementsByTagName("TD")[n];
      if (dir === "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir === "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
  if (dir === "asc") {
    dir = "desc";
  } else {
    dir = "asc";
  }
}

main();
