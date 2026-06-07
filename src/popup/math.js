export function trimText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

export function mlLatexToText(latexRoot) {
  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const cls = node.className || '';

    if (cls.includes('ML__sr-only')) return '';

    if (cls.includes('ML__msubsup')) {
      const base = '';
      const supVlist = node.querySelector('.ML__vlist');
      const sup = supVlist ? processChildren(supVlist) : '';
      return sup ? `^${sup}` : '';
    }

    if (cls.includes('ML__mfrac')) {
      const centers = node.querySelectorAll(
        ':scope > .ML__vlist-t > .ML__vlist-r > .ML__vlist > .ML__center',
      );
      const parts = [...centers].map((c) => processChildren(c)).filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[1]}/${parts[0]}`;
      }
      return processChildren(node);
    }

    if (cls.includes('ML__sqrt')) {
      const inner = node.querySelector('.ML__vlist');
      return inner ? `√(${processChildren(inner)})` : `√`;
    }

    if (
      cls.includes('ML__strut') ||
      cls.includes('ML__frac-line') ||
      cls.includes('ML__sqrt-line') ||
      cls.includes('ML__sqrt-sign') ||
      cls.includes('ML__nulldelimiter') ||
      cls.includes('ML__vlist-s')
    ) {
      return '';
    }

    return processChildren(node);
  }

  function processChildren(node) {
    return [...node.childNodes].map(processNode).join('');
  }

  return processChildren(latexRoot);
}

export function parseMLContent(element, doc) {
  const clone = element.cloneNode(true);
  clone.querySelectorAll('.ML__sr-only').forEach((n) => n.remove());
  clone.querySelectorAll('.ML__latex').forEach((ml) => {
    try {
      ml.replaceWith(doc.createTextNode(mlLatexToText(ml)));
    } catch (e) {
      console.warn('mlLatexToText failed:', e);
    }
  });
  return trimText(clone.textContent);
}
