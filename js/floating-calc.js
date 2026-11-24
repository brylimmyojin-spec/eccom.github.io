// Floating Chat-Style Quick Calculator Widget
(function () {
  if (window.__phFloatingCalcInit) return;
  window.__phFloatingCalcInit = true;

  function initFloatingCalc() {
    if (document.getElementById('floatingCalcRoot')) return;

    const root = document.createElement('div');
    root.id = 'floatingCalcRoot';
    root.className = 'floating-calc-root';
    root.innerHTML = `
      <!-- Floating Popup Panel -->
      <div class="floating-calc-panel shadow-lg" id="floatingCalcPanel" role="dialog" aria-label="Quick Calculator" aria-hidden="true">
        <div class="floating-calc-header" id="floatingCalcDragHandle" title="Drag to move calculator">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-calculator-fill"></i>
            <span class="fw-bold small">Quick Calculator</span>
          </div>
          <div class="d-flex align-items-center gap-1">
            <button type="button" class="btn btn-sm floating-calc-icon-btn" id="fcCopyBtn" title="Copy result">
              <i class="bi bi-clipboard"></i>
            </button>
            <button type="button" class="btn btn-sm floating-calc-icon-btn" id="fcCloseBtn" title="Close (Esc)">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Display -->
        <div class="floating-calc-display">
          <div class="floating-calc-history" id="fcHistory"></div>
          <div class="floating-calc-expr" id="fcExpr">&nbsp;</div>
          <div class="floating-calc-val" id="fcVal">0</div>
        </div>

        <!-- E-Com Quick Actions -->
        <div class="floating-calc-shortcuts">
          <button type="button" class="fc-chip" data-fn="addVat" title="Multiply by 1.12 (+12% VAT)">+12% VAT</button>
          <button type="button" class="fc-chip" data-fn="remVat" title="Divide by 1.12 (Ex-VAT)">÷1.12</button>
          <button type="button" class="fc-chip" data-fn="negate" title="Toggle sign">±</button>
          <button type="button" class="fc-chip" data-fn="clearHist" title="Clear history">Clr Hist</button>
        </div>

        <!-- Keypad -->
        <div class="floating-calc-grid">
          <button type="button" class="fc-key fc-key-util" data-key="AC">AC</button>
          <button type="button" class="fc-key fc-key-util" data-key="BACK"><i class="bi bi-backspace"></i></button>
          <button type="button" class="fc-key fc-key-util" data-key="%">%</button>
          <button type="button" class="fc-key fc-key-op" data-key="/">÷</button>

          <button type="button" class="fc-key" data-key="7">7</button>
          <button type="button" class="fc-key" data-key="8">8</button>
          <button type="button" class="fc-key" data-key="9">9</button>
          <button type="button" class="fc-key fc-key-op" data-key="*">×</button>

          <button type="button" class="fc-key" data-key="4">4</button>
          <button type="button" class="fc-key" data-key="5">5</button>
          <button type="button" class="fc-key" data-key="6">6</button>
          <button type="button" class="fc-key fc-key-op" data-key="-">−</button>

          <button type="button" class="fc-key" data-key="1">1</button>
          <button type="button" class="fc-key" data-key="2">2</button>
          <button type="button" class="fc-key" data-key="3">3</button>
          <button type="button" class="fc-key fc-key-op" data-key="+">+</button>

          <button type="button" class="fc-key fc-key-zero" data-key="0">0</button>
          <button type="button" class="fc-key" data-key=".">.</button>
          <button type="button" class="fc-key fc-key-eq" data-key="=">=</button>
        </div>
      </div>

      <!-- Floating Seller Portals Popup Panel -->
      <div class="floating-portals-panel shadow-lg" id="floatingPortalsPanel" role="dialog" aria-label="Seller Portals" aria-hidden="true">
        <div class="floating-portals-header">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-shop-window"></i>
            <span class="fw-bold small">PH Seller Portals</span>
          </div>
          <button type="button" class="btn btn-sm floating-calc-icon-btn" id="fpCloseBtn" title="Close (Esc)">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="floating-portals-body">
          <a href="https://seller.shopee.ph/" target="_blank" rel="noopener noreferrer" class="fp-link-card fp-shopee">
            <span class="fp-icon"><i class="bi bi-bag-fill"></i></span>
            <span class="fp-text">
              <span class="fp-title">Shopee Seller Centre</span>
              <span class="fp-sub">seller.shopee.ph</span>
            </span>
            <i class="bi bi-box-arrow-up-right fp-ext"></i>
          </a>
          <a href="https://seller-ph.tiktok.com/" target="_blank" rel="noopener noreferrer" class="fp-link-card fp-tiktok">
            <span class="fp-icon"><i class="bi bi-tiktok"></i></span>
            <span class="fp-text">
              <span class="fp-title">TikTok Shop Seller Center</span>
              <span class="fp-sub">seller-ph.tiktok.com</span>
            </span>
            <i class="bi bi-box-arrow-up-right fp-ext"></i>
          </a>
          <a href="https://sellercenter.lazada.com.ph/" target="_blank" rel="noopener noreferrer" class="fp-link-card fp-lazada">
            <span class="fp-icon"><i class="bi bi-shop"></i></span>
            <span class="fp-text">
              <span class="fp-title">Lazada Seller Center</span>
              <span class="fp-sub">sellercenter.lazada.com.ph</span>
            </span>
            <i class="bi bi-box-arrow-up-right fp-ext"></i>
          </a>
        </div>
        <div class="floating-portals-footer">
          <a href="seller-centers.html" class="text-decoration-none small fw-semibold d-flex align-items-center justify-content-between">
            <span>All Portal &amp; Marketing Links</span>
            <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>

      <!-- Floating Chat-Style Action Stack -->
      <div class="floating-fab-stack">
        <button type="button" class="floating-portals-fab shadow-lg" id="floatingPortalsFab" aria-label="Open Seller Portals" aria-expanded="false" title="Seller Portals (Shopee, TikTok, Lazada)">
          <i class="bi bi-shop-window fp-fab-icon-open"></i>
          <i class="bi bi-x-lg fp-fab-icon-close"></i>
        </button>
        <button type="button" class="floating-calc-fab shadow-lg" id="floatingCalcFab" aria-label="Open Quick Calculator" aria-expanded="false" title="Quick Calculator">
          <i class="bi bi-calculator-fill fc-fab-icon-open"></i>
          <i class="bi bi-x-lg fc-fab-icon-close"></i>
        </button>
      </div>
    `;

    document.body.appendChild(root);

    const panel = document.getElementById('floatingCalcPanel');
    const fab = document.getElementById('floatingCalcFab');
    const closeBtn = document.getElementById('fcCloseBtn');
    const portalsPanel = document.getElementById('floatingPortalsPanel');
    const portalsFab = document.getElementById('floatingPortalsFab');
    const portalsCloseBtn = document.getElementById('fpCloseBtn');
    const copyBtn = document.getElementById('fcCopyBtn');
    const exprEl = document.getElementById('fcExpr');
    const valEl = document.getElementById('fcVal');
    const histEl = document.getElementById('fcHistory');
    const dragHandle = document.getElementById('floatingCalcDragHandle');

    let isOpen = false;
    let isPortalsOpen = false;
    let current = '0';
    let expression = '';
    let justEvaluated = false;
    let history = [];

    // Safe arithmetic parser (+, -, *, /, unary -)
    function safeEval(exprStr) {
      const cleaned = exprStr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').trim();
      if (!cleaned || !/^[0-9+\-*/.() ]+$/.test(cleaned)) return null;
      try {
        const tokens = cleaned.match(/\d*\.?\d+|[+\-*/()]/g);
        if (!tokens) return null;
        let pos = 0;

        function parseExpr() {
          let left = parseTerm();
          while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
            const op = tokens[pos++];
            const right = parseTerm();
            left = op === '+' ? left + right : left - right;
          }
          return left;
        }
        function parseTerm() {
          let left = parseFactor();
          while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
            const op = tokens[pos++];
            const right = parseFactor();
            if (op === '/' && right === 0) return NaN;
            left = op === '*' ? left * right : left / right;
          }
          return left;
        }
        function parseFactor() {
          if (tokens[pos] === '-') {
            pos++;
            return -parseFactor();
          }
          if (tokens[pos] === '+') {
            pos++;
            return parseFactor();
          }
          if (tokens[pos] === '(') {
            pos++;
            const val = parseExpr();
            if (tokens[pos] === ')') pos++;
            return val;
          }
          return parseFloat(tokens[pos++]);
        }

        const res = parseExpr();
        if (!Number.isFinite(res)) return null;
        return Math.round(res * 1e10) / 1e10;
      } catch (e) {
        return null;
      }
    }

    function formatDisplay(numStr) {
      if (numStr === 'Error') return 'Error';
      if (numStr.endsWith('.')) {
        const n = Number(numStr.slice(0, -1));
        return Number.isFinite(n) ? n.toLocaleString('en-PH') + '.' : numStr;
      }
      if (numStr.includes('.')) {
        const [intPart, decPart] = numStr.split('.');
        const n = Number(intPart);
        return (Number.isFinite(n) ? n.toLocaleString('en-PH') : intPart) + '.' + decPart;
      }
      const n = Number(numStr);
      return Number.isFinite(n) ? n.toLocaleString('en-PH', { maximumFractionDigits: 8 }) : numStr;
    }

    function updateUI() {
      exprEl.textContent = expression ? expression.replace(/\*/g, '×').replace(/\//g, '÷') : '\u00A0';
      valEl.textContent = formatDisplay(current);
      histEl.innerHTML = history.slice(-3).map((item, idx) =>
        `<button type="button" class="fc-hist-pill" data-hist="${item.val}" title="Click to reuse">${item.val}</button>`
      ).join('');
    }

    function setOpen(open) {
      isOpen = open;
      if (open && isPortalsOpen) setPortalsOpen(false);
      root.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function setPortalsOpen(open) {
      isPortalsOpen = open;
      if (open && isOpen) setOpen(false);
      root.classList.toggle('is-portals-open', open);
      portalsPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
      portalsFab.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function handleKey(key) {
      if (current === 'Error' && key !== 'AC') {
        current = '0';
        expression = '';
      }

      if (key === 'AC') {
        current = '0';
        expression = '';
        justEvaluated = false;
      } else if (key === 'BACK') {
        if (justEvaluated) {
          expression = '';
          justEvaluated = false;
        } else {
          current = current.length > 1 ? current.slice(0, -1) : '0';
          if (current === '-') current = '0';
        }
      } else if (key === '%') {
        const n = parseFloat(current);
        if (Number.isFinite(n)) {
          current = String(Math.round((n / 100) * 1e10) / 1e10);
        }
      } else if (['+', '-', '*', '/'].includes(key)) {
        if (justEvaluated) {
          expression = current + ' ' + key + ' ';
          justEvaluated = false;
        } else if (expression && current === '0' && /[+\-*/]\s$/.test(expression)) {
          expression = expression.slice(0, -2) + key + ' ';
        } else {
          expression += current + ' ' + key + ' ';
        }
        current = '0';
      } else if (key === '=') {
        if (!expression) return;
        const fullExpr = expression + current;
        const result = safeEval(fullExpr);
        if (result === null) {
          current = 'Error';
          expression = '';
        } else {
          history.push({ expr: fullExpr, val: String(result) });
          expression = fullExpr + ' =';
          current = String(result);
        }
        justEvaluated = true;
      } else if (key === '.') {
        if (justEvaluated) {
          current = '0.';
          expression = '';
          justEvaluated = false;
        } else if (!current.includes('.')) {
          current += '.';
        }
      } else if (/^[0-9]$/.test(key)) {
        if (justEvaluated) {
          current = key;
          expression = '';
          justEvaluated = false;
        } else {
          current = current === '0' ? key : (current.length < 14 ? current + key : current);
        }
      }
      updateUI();
    }

    function handleShortcut(fn) {
      const n = parseFloat(current);
      if (fn === 'clearHist') {
        history = [];
        updateUI();
        return;
      }
      if (!Number.isFinite(n)) return;
      if (fn === 'addVat') {
        const res = Math.round(n * 1.12 * 100) / 100;
        expression = `${n} × 1.12 =`;
        current = String(res);
        history.push({ val: current });
        justEvaluated = true;
      } else if (fn === 'remVat') {
        const res = Math.round((n / 1.12) * 100) / 100;
        expression = `${n} ÷ 1.12 =`;
        current = String(res);
        history.push({ val: current });
        justEvaluated = true;
      } else if (fn === 'negate') {
        current = String(-n);
      }
      updateUI();
    }

    // Button listeners
    fab.addEventListener('click', () => setOpen(!isOpen));
    closeBtn.addEventListener('click', () => setOpen(false));
    portalsFab.addEventListener('click', () => setPortalsOpen(!isPortalsOpen));
    portalsCloseBtn.addEventListener('click', () => setPortalsOpen(false));

    panel.addEventListener('click', e => {
      const keyBtn = e.target.closest('button[data-key]');
      if (keyBtn) {
        handleKey(keyBtn.dataset.key);
        return;
      }
      const fnBtn = e.target.closest('button[data-fn]');
      if (fnBtn) {
        handleShortcut(fnBtn.dataset.fn);
        return;
      }
      const histBtn = e.target.closest('button[data-hist]');
      if (histBtn) {
        current = histBtn.dataset.hist;
        justEvaluated = false;
        updateUI();
      }
    });

    copyBtn.addEventListener('click', () => {
      if (current === 'Error') return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(current).then(() => {
          copyBtn.innerHTML = '<i class="bi bi-check2"></i>';
          setTimeout(() => { copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1200);
        }).catch(() => {});
      }
    });

    // Keyboard support when calculator is open and user isn't typing in a page form input
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (isPortalsOpen) setPortalsOpen(false);
        if (isOpen) setOpen(false);
        return;
      }
      if (!isOpen) return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (/^[0-9.]$/.test(e.key) || ['+', '-', '*', '/', '%'].includes(e.key)) {
        e.preventDefault();
        handleKey(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleKey('=');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKey('BACK');
      }
    });

    // Draggable Panel Header (Mouse & Touch)
    let dragging = false;
    let startX = 0, startY = 0, origRight = 0, origBottom = 0;

    function startDrag(clientX, clientY) {
      dragging = true;
      const rect = panel.getBoundingClientRect();
      startX = clientX;
      startY = clientY;
      origRight = window.innerWidth - rect.right;
      origBottom = window.innerHeight - rect.bottom;
      panel.style.transition = 'none';
    }

    function moveDrag(clientX, clientY) {
      if (!dragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      const nextRight = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, origRight - dx));
      const nextBottom = Math.max(8, Math.min(window.innerHeight - panel.offsetHeight - 8, origBottom - dy));
      panel.style.right = nextRight + 'px';
      panel.style.bottom = nextBottom + 'px';
    }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = '';
    }

    dragHandle.addEventListener('mousedown', e => {
      if (e.target.closest('button')) return;
      startDrag(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', endDrag);

    dragHandle.addEventListener('touchstart', e => {
      if (e.target.closest('button') || !e.touches[0]) return;
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      if (dragging && e.touches[0]) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', endDrag);

    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingCalc);
  } else {
    initFloatingCalc();
  }
})();
