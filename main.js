const titleSelector = "content__title";

let c = setInterval(() => {
  const title = document.querySelector(`.${titleSelector}`);
  if (title) {
    const contentId = extractContentIdFromUrl(window.location.href);

    chrome.storage.sync.get([contentId], function (result) {
      const contentTitleDiv = document.querySelector(".content__title");
      if (result[contentId]) {
        showNote(contentTitleDiv, contentId, result[contentId]);
      } else {
        showTextareaAndSaveButton(contentTitleDiv, contentId);
      }
    });
    clearInterval(c);
  }
}, 100);

function extractContentIdFromUrl(url) {
  const regex = /CD\d+/;
  const match = url.match(regex);
  return match ? match[0] : null;
}

function showNote(contentTitleDiv, contentId, noteContent) {
  const note = document.createElement("div");
  note.textContent = noteContent;
  note.style.color = "red";
  note.style.fontSize = "1rem";
  note.style.cursor = "pointer";
  contentTitleDiv.appendChild(note);

  note.addEventListener("click", function () {
    replaceNoteWithTextareaAndSaveButton(contentTitleDiv, note, contentId, noteContent);
  });
}

function showTextareaAndSaveButton(contentTitleDiv, contentId) {
  const textarea = document.createElement("textarea");
  textarea.classList.add("search__input");

  textarea.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "Enter") {
      saveButton.click();
    }
  });

  const saveButton = createSaveButton(contentId, textarea);
  saveButton.classList.add("ke-agent-sj-phone");

  contentTitleDiv.appendChild(textarea);
  contentTitleDiv.appendChild(saveButton);
}

function replaceNoteWithTextareaAndSaveButton(contentTitleDiv, note, contentId, noteContent) {
  const textarea = document.createElement("textarea");
  textarea.value = noteContent;
  const saveButton = createSaveButton(contentId, textarea, note, contentTitleDiv);

  contentTitleDiv.replaceChild(textarea, note);
  contentTitleDiv.appendChild(saveButton);
}

function createSaveButton(contentId, textarea, note = null, contentTitleDiv = null) {
  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";

  saveButton.addEventListener("click", function () {
    const noteContent = textarea.value;
    const data = {};
    data[contentId] = noteContent;
    chrome.storage.sync.set(data, function () {
      showToast("Note saved!");
      if (note && contentTitleDiv) {
        note.textContent = noteContent;
        contentTitleDiv.replaceChild(note, textarea);
        contentTitleDiv.removeChild(saveButton);
      }
    });
  });

  return saveButton;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "10px";
  toast.style.right = "10px";
  toast.style.padding = "10px";
  toast.style.backgroundColor = "black";
  toast.style.color = "white";
  toast.style.borderRadius = "5px";
  toast.style.zIndex = "9999";
  document.body.appendChild(toast);

  setTimeout(function () {
    toast.remove();
  }, 3000);
}
