import { mlLatexToText, parseMLContent, trimText } from './math';

const htmlInput = document.getElementById('htmlInput');
const output = document.getElementById('output');
const statusBadge = document.getElementById('status');
const copyButton = document.getElementById('copyButton');
const clearButton = document.getElementById('clearButton');
const manualMode = document.getElementById('manualMode');
const manualPanel = document.getElementById('manualPanel');

const emptyAutoMessage = '';
const emptyManualMessage = 'Paste HTML to see the extracted question';
const noQuestionMessage = 'No question found';

function getTextWithoutControls(element) {
  const clone = element.cloneNode(true);
  clone
    .querySelectorAll('input, button, select, textarea, span.ML__sr-only')
    .forEach((n) => n.remove());

  clone.querySelectorAll('.ML__latex').forEach((ml) => {
    const text = mlLatexToText(ml);
    ml.replaceWith(document.createTextNode(text));
  });

  return trimText(clone.textContent);
}

function extractQuestion(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const card = [...doc.querySelectorAll('.card-body')].find((el) =>
    el.querySelector('.h5'),
  );
  if (!card) return noQuestionMessage;

  const questionElement = card.querySelector('.h5');
  const question = parseMLContent(questionElement, doc);
  if (!question) return noQuestionMessage;

  const answers = [...card.querySelectorAll('.test-option')].map(
    (option, index) => {
      const p = option.querySelector('p');
      const answer = p
        ? parseMLContent(p, doc)
        : getTextWithoutControls(option);
      return `${index + 1}) ${answer}`;
    },
  );

  return [question, ...answers].join('\n');
}

function setStatus(text, state = '') {
  statusBadge.textContent = text;
  statusBadge.className = state ? `status ${state}` : 'status';
}

function showResult(result, readyText) {
  output.textContent = result;

  if (result === noQuestionMessage) {
    setStatus('Question not found', 'is-error');
    copyButton.disabled = true;
    return;
  }

  setStatus(readyText, 'is-ready');
  copyButton.disabled = false;
}

function updateManualOutput() {
  if (!htmlInput.value.trim()) {
    output.textContent = emptyManualMessage;
    setStatus('Waiting for HTML');
    copyButton.disabled = true;
    return;
  }

  const result = extractQuestion(htmlInput.value);
  showResult(result, 'Manual result is live');
}

function getChromeError(fallback) {
  return chrome.runtime.lastError?.message || fallback;
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tabs[0];
}

function getPageHtmlFromMessage(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_HTML' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(response);
    });
  });
}

async function getPageHtmlFromScript(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({
      html: document.documentElement.outerHTML,
      title: document.title,
      url: window.location.href,
    }),
  });

  return results[0]?.result;
}

async function readActivePage() {
  if (!globalThis.chrome?.tabs || !globalThis.chrome?.runtime) {
    throw new Error(
      'Open this popup from the installed extension to detect a page.',
    );
  }

  const tab = await getActiveTab();

  try {
    const result = await getPageHtmlFromScript(tab.id);
    console.log('script result:', result);
    return result;
  } catch (err2) {
    console.log('script also failed:', err2.message);
    throw err2;
  }
}

async function detectFromPage() {
  output.textContent = emptyAutoMessage;
  setStatus('Detecting from page');
  copyButton.disabled = true;

  try {
    const page = await readActivePage();

    if (!page?.html) {
      throw new Error('No page HTML found.');
    }

    showResult(extractQuestion(page.html), 'Detected from page');
  } catch (error) {
    output.textContent = noQuestionMessage;
    setStatus('Could not detect page', 'is-error');
    copyButton.disabled = true;
  }
}

function setMode() {
  const isManual = manualMode.checked;
  manualPanel.classList.toggle('is-hidden', !isManual);
  clearButton.textContent = isManual ? 'Clear' : 'Clear Result';

  if (isManual) {
    updateManualOutput();
    htmlInput.focus();
    return;
  }

  detectFromPage();
}

htmlInput.addEventListener('input', updateManualOutput);

manualMode.addEventListener('change', setMode);

copyButton.addEventListener('click', async () => {
  if (!output.textContent.trim()) {
    return;
  }
  const hasIcon = copyButton.innerHTML.includes('light-icon');

  await navigator.clipboard.writeText(output.textContent);
  copyButton.textContent = 'Copied';
  setTimeout(() => {
    if (hasIcon) {
      copyButton.innerHTML = `<i class="light-icon-clipboard-check tick-icon"></i>`;
    } else {
      copyButton.textContent = 'Copy Result';
    }
  }, 1200);
});

clearButton.addEventListener('click', () => {
  if (manualMode.checked) {
    htmlInput.value = '';
    updateManualOutput();
    htmlInput.focus();
    return;
  }

  output.textContent = emptyAutoMessage;
  setStatus('Waiting to detect');
  copyButton.disabled = true;
});

setMode();
