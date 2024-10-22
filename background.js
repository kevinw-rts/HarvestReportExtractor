let downloadInProgress = false; // To prevent multiple downloads

chrome.downloads.onChanged.addListener((delta) => {
  // Only act if the download is complete
  if (
    delta.state &&
    delta.state.current === "complete" &&
    !downloadInProgress
  ) {
    chrome.downloads.search({ id: delta.id }, (items) => {
      const item = items[0];

      // Check if the downloaded file is a CSV from Harvest
      if (
        item.filename.endsWith(".csv") &&
        item.url.includes("harvestapp.com")
      ) {
        console.log("CSV download completed, processing:", item.filename);

        downloadInProgress = true;

        // Read the downloaded CSV file
        readAndProcessCSV(item);
      }
    });
  }
});

// Function to read the downloaded CSV file and process it
function readAndProcessCSV(item) {
  fetch(item.url)
    .then((response) => response.text())
    .then((csvData) => {
      console.log("Successfully fetched the CSV file");

      // Parse and filter the CSV content
      const filteredCSV = filterCSVColumnsByName(csvData);

      // Trigger the filtered CSV download
      downloadFilteredCSV(filteredCSV);

      // Reset flag to allow new downloads
      downloadInProgress = false;
    })
    .catch((error) => {
      console.error("Error processing CSV:", error);
      downloadInProgress = false; // Reset flag in case of error
    });
}

// Function to filter the CSV by the column names
function filterCSVColumnsByName(csvData) {
  const allLines = csvData.split(/\r\n|\n/);
  const headers = allLines[0].split(",");

  // Specify the columns we want to keep
  const columnsToKeep = [
    "Date",
    "Task",
    "Notes",
    "Hours",
    "First Name",
    "Last Name",
  ];

  // Get the indices of the columns to keep
  const indicesToKeep = columnsToKeep.map((column) => headers.indexOf(column));

  if (indicesToKeep.includes(-1)) {
    console.error(
      "Some columns were not found in the CSV headers:",
      columnsToKeep
    );
    return;
  }

  // Filter the CSV content based on those columns
  const filteredCSV = allLines
    .map((line) => {
      const columns = line.split(",");
      return indicesToKeep.map((index) => columns[index]).join(",");
    })
    .join("\n");

  return filteredCSV;
}

// Function to download the filtered CSV using chrome.downloads API
function downloadFilteredCSV(csvContent) {
  // Create a Blob from the CSV content
  const blob = new Blob([csvContent], { type: "text/csv" });

  // Convert the Blob to a data URL using FileReader (since createObjectURL is not available in service workers)
  const reader = new FileReader();

  reader.onload = function (event) {
    const dataUrl = event.target.result;

    // Use chrome.downloads.download to trigger the download
    chrome.downloads.download(
      {
        url: dataUrl,
        filename: "filtered_harvest_report.csv",
        saveAs: true,
      },
      function (downloadId) {
        if (chrome.runtime.lastError) {
          console.error(
            "Error triggering download:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log(
            "Filtered CSV downloaded successfully with downloadId:",
            downloadId
          );
        }
      }
    );
  };

  // Read the Blob as a data URL
  reader.readAsDataURL(blob);
}
