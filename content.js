console.log("Content script is running");

// Function to extract the table and filter columns
function extractTimeReport() {
  let rows = document.querySelectorAll("table tbody tr");
  if (rows.length === 0) {
    console.log("No table rows found.");
    return [];
  }

  console.log(`Found ${rows.length} rows`);

  let reportData = [];

  rows.forEach((row) => {
    let columns = row.querySelectorAll("td");
    let rowData = {
      date: columns[0].innerText,
      task: columns[4].innerText,
      notes: columns[5].innerText,
      hours: columns[6].innerText,
      firstName: columns[10].innerText,
      lastName: columns[11].innerText,
    };
    reportData.push(rowData);
  });

  console.log("Extracted report data:", reportData);
  return reportData;
}

// Function to convert the filtered data into CSV format
function convertToCSV(data) {
  const header = ["Date", "Task", "Notes", "Hours", "First Name", "Last Name"];
  const rows = data.map((row) => [
    row.date,
    row.task,
    row.notes,
    row.hours,
    row.firstName,
    row.lastName,
  ]);

  let csvContent =
    "data:text/csv;charset=utf-8," +
    header.join(",") +
    "\n" +
    rows.map((e) => e.join(",")).join("\n");

  console.log("CSV content generated");
  return csvContent;
}

// Function to download the CSV file
function downloadCSV(csvContent) {
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "filtered_harvest_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log("CSV downloaded");
}

// Trigger the extraction and download process
const reportData = extractTimeReport();
if (reportData.length > 0) {
  const csvContent = convertToCSV(reportData);
  downloadCSV(csvContent);
} else {
  console.log("No data to download");
}
