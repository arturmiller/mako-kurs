(function () {
  const MESSAGE_TYPES = {
    UTILMD: ['Utilities Master Data Message', 'Übermittelt Stammdaten und prozessbezogene Änderungen, etwa zu Marktpartnern, Lokationen oder Zuordnungen.'],
    MSCONS: ['Metered Services Consumption Report Message', 'Übermittelt Messwerte, Zählerstände und Energiemengen zwischen Marktpartnern.'],
    INVOIC: ['Invoice Message', 'Übermittelt elektronische Rechnungen, beispielsweise für Netznutzung oder energiewirtschaftliche Leistungen.'],
    REMADV: ['Remittance Advice Message', 'Übermittelt die Zahlungs- oder Ablehnungsinformation zu einer Rechnung und kann Abweichungsgründe nennen.'],
    APERAK: ['Application Error and Acknowledgement Message', 'Meldet Anwendungsfehler in einer syntaktisch lesbaren Nachricht.'],
    CONTRL: ['Syntax and Service Report Message', 'Bestätigt oder beanstandet die syntaktische Verarbeitung eines EDIFACT-Interchanges oder einer Nachricht.']
  };
  const MESSAGE_TYPE_PATTERN = new RegExp(`\\b(${Object.keys(MESSAGE_TYPES).join('|')})\\b`, 'g');
  let tooltipId = 0;

  function annotateMessageTypes(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE || root.matches('.message-term, script, style, textarea')) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!MESSAGE_TYPE_PATTERN.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        MESSAGE_TYPE_PATTERN.lastIndex = 0;
        return node.parentElement?.closest('.message-term, script, style, textarea')
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      node.nodeValue.replace(MESSAGE_TYPE_PATTERN, (match, type, offset) => {
        fragment.append(node.nodeValue.slice(cursor, offset));
        const [name, description] = MESSAGE_TYPES[type];
        const term = document.createElement('span');
        const id = `message-tooltip-${++tooltipId}`;
        term.className = 'message-term';
        term.tabIndex = 0;
        term.title = `${name}: ${description}`;
        term.setAttribute('aria-describedby', id);
        term.append(type);
        const tooltip = document.createElement('span');
        tooltip.className = 'message-tooltip';
        tooltip.id = id;
        tooltip.setAttribute('role', 'tooltip');
        tooltip.innerHTML = `<strong>${name}</strong><span>${description}</span>`;
        term.append(tooltip);
        fragment.append(term);
        cursor = offset + match.length;
        return match;
      });
      fragment.append(node.nodeValue.slice(cursor));
      node.replaceWith(fragment);
    });
  }

  function initMessageTooltips() {
    const content = document.querySelector('main, article, .wrap');
    if (!content) return;
    annotateMessageTypes(content);
    new MutationObserver((mutations) => mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) annotateMessageTypes(node);
      else if (node.nodeType === Node.TEXT_NODE && node.parentElement) annotateMessageTypes(node.parentElement);
    }))).observe(content, {childList: true, subtree: true});
  }

  const EXCLUDED = [
    '.quiz', '.final', '.finalq', '.score-box', '.matching', '.order-box',
    '.sourcebox', '.lesson-nav', '.narration-copy', '.objectives', '#ziele',
    '.course-home', '.nav-inner', '.footer', '.sources', '.source-list',
    '.source-note', 'button', 'input', 'select', 'textarea', 'script', 'style'
  ].join(',');

  function toSpeechText(value) {
    return value
      .replace(/(\d{4})-(\d{2})-(\d{2})/g, '$3.$2.$1')
      .replace(/\bLFN\b/g, 'neuer Lieferant')
      .replace(/\bLFA\b/g, 'alter Lieferant')
      .replace(/\bMSB\b/g, 'Messstellenbetreiber')
      .replace(/\bBKV\b/g, 'Bilanzkreisverantwortlicher')
      .replace(/\bÜNB\b/g, 'Übertragungsnetzbetreiber')
      .replace(/\bVNB\b/g, 'Verteilnetzbetreiber')
      .replace(/\bNB\b/g, 'Netzbetreiber')
      .replace(/\bLF\b/g, 'Lieferant')
      .replace(/\bMaLo\b/g, 'Marktlokation')
      .replace(/\bMeLo\b/g, 'Messlokation')
      .replace(/\bkWh\b/gi, 'Kilowattstunden')
      .replace(/\bm³\b/g, 'Kubikmeter')
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bEDIFACT\b/g, 'E D I F A C T')
      .replace(/\bUTILMD\b/g, 'U T I L M D')
      .replace(/<->/g, ' steht in Beziehung zu ')
      .replace(/->/g, ' führt zu ')
      .replace(/<-/g, ' kommt von ')
      .replace(/→|⇒|▶|⟶/g, ' führt zu ')
      .replace(/←|⇐|◀|⟵/g, ' kommt von ')
      .replace(/↔|⇔|⟷/g, ' steht in Beziehung zu ')
      .replace(/≠/g, ' ist nicht gleich ')
      .replace(/≤/g, ' ist kleiner oder gleich ')
      .replace(/≥/g, ' ist größer oder gleich ')
      .replace(/=/g, ' ergibt ')
      .replace(/\+/g, ' plus ')
      .replace(/−/g, ' minus ')
      .replace(/\s-\s/g, ' minus ')
      .replace(/×/g, ' mal ')
      .replace(/÷/g, ' geteilt durch ')
      .replace(/%/g, ' Prozent ')
      .replace(/€/g, ' Euro ')
      .replace(/§/g, ' Paragraph ')
      .replace(/&/g, ' und ')
      .replace(/\//g, ' pro ')
      .replace(/\|/g, ' oder ')
      .replace(/#/g, ' Nummer ')
      .replace(/(\d)\s*[–—]\s*(\d)/g, '$1 bis $2')
      .replace(/[–—]/g, ', ')
      .replace(/[{}\[\]<>_*~^]/g, ' ')
      .replace(/[┌┐└┘├┤┬┴┼─│╭╮╯╰]/g, ' ')
      .replace(/[✓✔✕✖●◉◆◇■□▲△▼▽★☆►◄▶◀▸◂▹◃▻◅]/g, ' ')
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .trim();
  }

  function spokenText() {
    const source = document.querySelector('main')
      || document.querySelector('article')
      || document.querySelector('.wrap')
      || document.body;
    const clone = source.cloneNode(true);
    clone.querySelectorAll(EXCLUDED).forEach((node) => node.remove());

    const title = toSpeechText(document.querySelector('h1')?.textContent || '');
    const subtitle = toSpeechText(document.querySelector('.subtitle, .lede')?.textContent || '');

    const blockSelector = 'h1, h2, h3, h4, p, li, pre, blockquote, div';
    const blocks = [...clone.querySelectorAll(blockSelector)]
      .filter((node) => !node.querySelector(blockSelector))
      .map((node) => {
        let text = toSpeechText(node.textContent);
        if (!text) return '';
        if (/^H1$/i.test(node.tagName)) return '';
        if (/^H[2-4]$/i.test(node.tagName)) return `${text}.`;
        if (/^PRE$/i.test(node.tagName)) return `Modell: ${text}.`;
        return /[.!?]$/.test(text) ? text : `${text}.`;
      })
      .filter((text) => text
        && !/^(zurück|weiter|menü|navigation|quelle|quellen|auswertung|punkte)\.?$/i.test(text)
        && !/^(klicke|wähle|ordne|ziehe|drücke|tippe|starte den|teste jetzt|prüfe deine)\b/i.test(text)
        && !/^noch nicht (ausgewertet|beantwortet)/i.test(text));

    const deduplicated = blocks.filter((block, index) => block !== blocks[index - 1]);
    const opening = [title ? `Lektion: ${title}.` : '', subtitle || ''].filter(Boolean);
    return [...opening, ...deduplicated]
      .filter((block, index, all) => block !== all[index - 1])
      .join('\n\n');
  }

  async function copy(text, status) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    status.textContent = 'Text wurde kopiert.';
    window.setTimeout(() => { status.textContent = ''; }, 2500);
  }

  function initNarrationCopy() {
    if (document.querySelector('.narration-copy')) return;

    const control = document.createElement('details');
    control.className = 'narration-copy';
    control.innerHTML = `
      <summary>
        <span>Text zum Vorlesen</span>
        <span class="narration-tools">
          <button type="button">Text kopieren</button>
          <span role="status" aria-live="polite"></span>
        </span>
      </summary>
      <div class="narration-text" tabindex="0"></div>`;

    const style = document.createElement('style');
    style.textContent = `
      .narration-copy{width:min(1080px,calc(100% - 32px));margin:1rem auto;border:1px solid #d9e2ef;border-radius:14px;background:#fff;color:#172033}
      .narration-copy summary{display:flex;align-items:center;gap:1rem;padding:.7rem .8rem .7rem 1.1rem;cursor:pointer;font:750 16px/1.3 system-ui;list-style:none}
      .narration-copy summary::-webkit-details-marker{display:none}
      .narration-copy summary>span:first-child{margin-right:auto}
      .narration-tools{display:flex;align-items:center;gap:.7rem}
      .narration-copy[open] summary{border-bottom:1px solid #ddd9ce}
      .narration-copy button{border:0;border-radius:10px;padding:.75rem 1rem;background:var(--accent,#5b36c9);color:white;font:700 15px/1 system-ui;cursor:pointer}
      .narration-copy button:hover{filter:brightness(.96)}.narration-copy [role=status]{font:700 14px/1.3 system-ui;color:var(--accent2,#0b6b63)}
      .narration-text{padding:1rem 1.2rem;white-space:pre-wrap;user-select:text;font:16px/1.7 system-ui}
      .message-term{position:relative;display:inline-block;border-bottom:2px dotted currentColor;font-weight:750;cursor:help;outline-offset:3px}
      .message-tooltip{position:absolute;z-index:100;left:50%;bottom:calc(100% + 9px);width:min(330px,80vw);padding:12px 14px;border-radius:12px;background:#172033;color:#fff;box-shadow:0 12px 34px rgba(15,23,42,.25);font:14px/1.45 system-ui;text-align:left;white-space:normal;letter-spacing:normal;text-transform:none;opacity:0;visibility:hidden;pointer-events:none;transform:translate(-50%,5px);transition:opacity .15s,transform .15s,visibility .15s}
      .message-tooltip::after{content:'';position:absolute;top:100%;left:50%;margin-left:-6px;border:6px solid transparent;border-top-color:#172033}.message-tooltip strong,.message-tooltip span{display:block}.message-tooltip strong{margin-bottom:4px;color:#d9f0e6}.message-term:hover>.message-tooltip,.message-term:focus>.message-tooltip,.message-term:focus-visible>.message-tooltip{opacity:1;visibility:visible;transform:translate(-50%,0)}
      @media(max-width:600px){.narration-copy summary{align-items:flex-start;flex-wrap:wrap}.narration-tools{width:100%;justify-content:flex-end}.narration-copy [role=status]{flex:1}}
      @media print{.narration-copy,.message-tooltip{display:none}.message-term{border:0}}
    `;
    document.head.appendChild(style);

    const anchor = document.querySelector('.hero')
      || document.querySelector('header')
      || document.querySelector('main')
      || document.querySelector('.wrap');
    if (anchor && anchor.matches('.hero, header')) anchor.insertAdjacentElement('afterend', control);
    else if (anchor) anchor.prepend(control);
    else document.body.prepend(control);

    const narration = control.querySelector('.narration-text');
    const status = control.querySelector('[role=status]');
    const ensureText = () => {
      if (!narration.textContent) narration.textContent = spokenText();
      return narration.textContent;
    };
    control.addEventListener('toggle', () => {
      if (control.open) ensureText();
    });
    control.querySelector('button').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      copy(ensureText(), status);
    });
  }

  window.initNarrationCopy = initNarrationCopy;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initMessageTooltips(); initNarrationCopy(); });
  } else {
    initMessageTooltips();
    initNarrationCopy();
  }
})();
