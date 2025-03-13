document.addEventListener('DOMContentLoaded', (e) => {
  const input2 = document.getElementById('sheetID');
  const saveButton = document.getElementById('saveButton');

  // Load data from Chrome storage when initializing
  chrome.storage.local.get(['sheetID'], (result) => {
    input2.value = result.sheetID || '';
  });

  // Function to save data to Chrome storage
  const saveData = () => {
    chrome.storage.local.set({
      sheetID: input2.value
    });
  };

  // Save data when user clicks the save button
  saveButton.addEventListener('click', () => {
    saveData();
    showToast('Data saved successfully!');
  });

  // Save data when user leaves the input fields
  input1.addEventListener('blur', () => {
    saveData();
    showToast('Data saved successfully!');
  });

  input2.addEventListener('blur', () => {
    saveData();
    showToast('Data saved successfully!');
  });

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };
});
