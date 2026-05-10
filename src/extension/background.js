// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {

});

// Handle messages from Content Scripts and Sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROCESS_REVIEW') {
    handleProcessReview(message.payload, sender, sendResponse);
    return true; 
  }
  
  if (message.type === 'INSERT_REPLY') {
    handleInsertReply(message.payload, sendResponse);
    return true;
  }
});

async function handleProcessReview(payload, sender, sendResponse) {
  try {
    const tabId = sender.tab.id;

    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true
    });
    
    await chrome.sidePanel.open({ tabId });

    await chrome.storage.local.set({ 
      currentReview: {
        ...payload,
        status: 'loading',
        timestamp: Date.now()
      } 
    });

    sendResponse({ status: 'success' });
  } catch (error) {
    console.error('Background Error:', error);
    sendResponse({ status: 'error', message: error.message });
  }
}

async function handleInsertReply(payload, sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error("No active tab found");

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'INSERT_REPLY',
      payload: { text: payload.text }
    });
    
    sendResponse(response);
  } catch (error) {
    console.error('Insert Error:', error);
    sendResponse({ status: 'error', message: error.message });
  }
}


