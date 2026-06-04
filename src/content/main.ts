chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'GET_PAGE_HTML') {
    return false;
  }

  sendResponse({
    html: document.documentElement.outerHTML,
    title: document.title,
    url: window.location.href,
  });

  return false;
});
