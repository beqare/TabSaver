const sessionNameInput = document.getElementById("session-name-input");
const saveCurrentTabsButton = document.getElementById("save-current-tabs");
const sessionList = document.getElementById("session-list");
const notification = document.getElementById("notification");

document.addEventListener("DOMContentLoaded", loadSessions);

saveCurrentTabsButton.addEventListener("click", saveCurrentTabs);

// Allow saving with Enter key
sessionNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    saveCurrentTabs();
  }
});

// Show notification
function showNotification(message, isError = false) {
  notification.textContent = message;
  notification.style.backgroundColor = isError ? "#e74c3c" : "#2ecc71";
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Update badge with session count
function updateBadge(sessionCount) {
  if (sessionCount > 0) {
    const badgeText = sessionCount > 99 ? "99+" : sessionCount.toString();
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: "#4c87af" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

// Save current tabs
async function saveCurrentTabs() {
  const sessionName = sessionNameInput.value.trim();
  if (!sessionName) {
    showNotification("Please enter a name for your session!", true);
    sessionNameInput.focus();
    return;
  }

  try {
    let tabs = await chrome.tabs.query({ currentWindow: true });

    // Filter out chrome:// URLs which can't be restored
    const tabUrls = tabs
      .map((tab) => ({ url: tab.url, title: tab.title }))
      .filter((tab) => tab.url && !tab.url.startsWith("chrome://"));

    if (tabUrls.length === 0) {
      showNotification("No restorable tabs found!", true);
      return;
    }

    const sessionData = {
      name: sessionName,
      tabs: tabUrls,
      timestamp: new Date().toISOString(),
      tabCount: tabUrls.length,
    };

    chrome.storage.sync.get(["sessions"], (result) => {
      const sessions = result.sessions || [];

      // Check if session name already exists
      if (sessions.some((session) => session.name === sessionName)) {
        showNotification("Session name already exists!", true);
        return;
      }

      sessions.push(sessionData);
      chrome.storage.sync.set({ sessions: sessions }, () => {
        if (chrome.runtime.lastError) {
          showNotification(
            "Error saving session: " + chrome.runtime.lastError.message,
            true
          );
          return;
        }

        sessionNameInput.value = "";
        loadSessions();
        updateBadge(sessions.length);
        showNotification(`Session "${sessionName}" saved successfully!`);
      });
    });
  } catch (error) {
    console.error("Error saving tabs:", error);
    showNotification("Error saving tabs: " + error.message, true);
  }
}

// Load all saved sessions
function loadSessions() {
  chrome.storage.sync.get(["sessions"], (result) => {
    if (chrome.runtime.lastError) {
      showNotification(
        "Error loading sessions: " + chrome.runtime.lastError.message,
        true
      );
      return;
    }

    const sessions = result.sessions || [];
    updateBadge(sessions.length);
    sessionList.innerHTML = "";

    if (sessions.length === 0) {
      sessionList.innerHTML = `
        <div class="empty-state">
          <div>📁</div>
          <p>No sessions saved yet</p>
        </div>
      `;
      return;
    }

    sessions
      .slice()
      .reverse()
      .forEach((session, displayIndex) => {
        const actualIndex = sessions.length - 1 - displayIndex;
        const sessionElement = document.createElement("div");
        sessionElement.className = "session-item";

        const date = new Date(session.timestamp);
        const formattedDate =
          date.toLocaleDateString() +
          " " +
          date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        sessionElement.innerHTML = `
          <div class="session-info" data-index="${actualIndex}">
            <div class="session-name">${escapeHtml(session.name)}</div>
            <div class="session-meta">${
              session.tabCount
            } tabs • ${formattedDate}</div>
          </div>
          <div class="session-actions">
            <button class="action-btn btn-success open-btn" data-urls='${JSON.stringify(
              session.tabs
            )}'>Open</button>
            <button class="action-btn btn-danger delete-btn" data-index="${actualIndex}">Delete</button>
          </div>
        `;
        sessionList.appendChild(sessionElement);
      });

    // Add event listeners
    document.querySelectorAll(".open-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const urls = JSON.parse(e.target.getAttribute("data-urls"));
        openSession(urls);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(e.target.getAttribute("data-index"));
        deleteSession(index);
      });
    });

    document.querySelectorAll(".session-info").forEach((element) => {
      element.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.getAttribute("data-index"));
        showSessionDetails(index);
      });
    });
  });
}

// Open a saved session
function openSession(tabs) {
  if (!tabs || tabs.length === 0) {
    showNotification("No tabs to open!", true);
    return;
  }

  const urls = tabs.map((tab) => tab.url).filter((url) => url);

  if (urls.length === 0) {
    showNotification("No valid URLs to open!", true);
    return;
  }

  chrome.windows.create({ url: urls }, () => {
    if (chrome.runtime.lastError) {
      showNotification(
        "Error opening session: " + chrome.runtime.lastError.message,
        true
      );
      return;
    }
    showNotification(`Opening ${urls.length} tabs...`);
    setTimeout(() => window.close(), 500);
  });
}

// Delete a session
function deleteSession(index) {
  if (!confirm("Are you sure you want to delete this session?")) {
    return;
  }

  chrome.storage.sync.get(["sessions"], (result) => {
    if (chrome.runtime.lastError) {
      showNotification(
        "Error deleting session: " + chrome.runtime.lastError.message,
        true
      );
      return;
    }

    const sessions = result.sessions || [];
    const sessionName = sessions[index].name;
    sessions.splice(index, 1);

    chrome.storage.sync.set({ sessions: sessions }, () => {
      if (chrome.runtime.lastError) {
        showNotification(
          "Error deleting session: " + chrome.runtime.lastError.message,
          true
        );
        return;
      }

      loadSessions();
      updateBadge(sessions.length);
      showNotification(`Session "${sessionName}" deleted`);
    });
  });
}

// Show session details (placeholder for future enhancement)
function showSessionDetails(index) {
  chrome.storage.sync.get(["sessions"], (result) => {
    const sessions = result.sessions || [];
    const session = sessions[index];

    if (session) {
      const tabList = session.tabs
        .map((tab) => `• ${tab.title || "Untitled"}\n  ${tab.url}`)
        .join("\n");

      alert(`Session: ${session.name}\n\nTabs:\n${tabList}`);
    }
  });
}

// Utility function to escape HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
