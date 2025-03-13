let SHEET_ID = "";
const SHEET_NAME = "Sheet1";

// Function to fetch data from Google Sheets
async function fetchSheetData() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(null);
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      resolve(data.values);
    });
  });
}

// Function to get data from Chrome sync storage
function getChromeSyncData() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, (result) => {
      resolve(result);
    });
  });
}

// Function to set data to Chrome sync storage
function setChromeSyncData(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, () => {
      resolve();
    });
  });
}

// Function to update Google Sheets with new data
async function updateSheetData(data) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(null);
      }

      const formattedValues = Object.entries(data || {}).map(([key, value]) => {
        return [key, value];
      });
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            range: SHEET_NAME,
            majorDimension: "ROWS",
            values: formattedValues,
          }),
        }
      );

      const result = await response.json();
      resolve(result);
    });
  });
}

// Function to combine data from Google Sheets and Chrome sync storage
async function combineData() {
  const sheetData = await fetchSheetData();
  const chromeData = await getChromeSyncData();
  console.log(chromeData);

  if (!sheetData) {
    return;
  }
  const formattedSheetData = sheetData.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  const combinedData = { ...formattedSheetData, ...chromeData };
  await setChromeSyncData(combinedData);
}

// Function to periodically upload Chrome sync storage data to Google Sheets
async function uploadDataPeriodically() {
  const chromeData = await getChromeSyncData();
  await updateSheetData(chromeData);

  chrome.alarms.create("uploadData", { periodInMinutes: 1 });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "uploadData") {
      const chromeData = await getChromeSyncData();
      await updateSheetData(chromeData);
    }
  });
}

async function getSheetConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["sheetID"], (result) => {
      console.log(result);
      resolve(result);
    });
  });
}

// Initialize the process
async function init() {
  // Remove notes from Chrome sync storage, if any
  chrome.storage.sync.remove(["notes", 'data'], async () => {
    console.log("Notes removed from Chrome sync storage");
    const config = await getSheetConfig();
    SHEET_ID = config.sheetID;
    await combineData();
    uploadDataPeriodically();
  });
}

// Start the process
init();
