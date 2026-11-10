// Core Calculator Engine & Helpers
const STORAGE_KEY = 'ph-marketplace-calculator-settings-v2';
const PROFILE_STORAGE_KEY = 'ph-marketplace-business-profile-v1';

const pe = n => (Number(n || 0) * 100).toFixed(2) + '%';
const P = n => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CONFIG_IDS = [
  'nv', 'vat', 'cost', 'units', 'mg', 'srp',
  'cs', 'ct', 'cl', 'osh', 'ott', 'camp',
  'wht', 'claim', 'pack', 'opex', 'adcost', 'target-roas'
];

// Default profile schema
function getDefaultProfile() {
  return {
    shopName: 'My Online Store',
    taxStatus: 'non-vat', // 'non-vat' or 'vat'
    claimInputVat: false,
    includeWht: true,
    whtExempt: false,
    defaultMargin: 20,
    packagingCost: 0,
    platforms: {
      sh: {
        adCost: 0,
        opex: 0,
        targetRoas: 3,
        optIn: false,
        notes: 'Shopee Ads (Discovery, Search)'
      },
      tt: {
        adCost: 0,
        opex: 0,
        targetRoas: 3,
        optIn: false,
        notes: 'TikTok GMV Max & Live Production'
      },
      lz: {
        adCost: 0,
        opex: 0,
        targetRoas: 3,
        optIn: false,
        notes: 'Lazada Sponsored Solutions'
      }
    }
  };
}

function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return getDefaultProfile();
    const parsed = JSON.parse(raw);
    return { ...getDefaultProfile(), ...parsed, platforms: { ...getDefaultProfile().platforms, ...(parsed.platforms || {}) } };
  } catch (e) {
    return getDefaultProfile();
  }
}

function saveProfileToStorage(profile) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch (e) {
    console.warn('Profile save failed:', e);
    return false;
  }
}

function fees(p, o) {
  const catList = (PL[p] && PL[p].c) || [];
  const catIdx = Math.max(0, Math.min(catList.length - 1, (o.cat && o.cat[p]) || 0));
  const c = catList[catIdx] || ["General", 0.09];

  const F = {
    cat: c[0],
    comm: c[1] || 0.09,
    trans: 0.0224, // 2.24% (2% + 12% VAT on transaction fee)
    growth: p === 'sh' ? 0.015 : p === 'tt' ? (c[2] || 0) : 0,
    ship: p === 'lz' ? 0 : p === 'sh' ? 0.056 : 0.055,
    cap: 100,
    opf: 5,
    promo: 0,
    pcap: 200,
    pn: '',
    mand: false
  };

  if (p === 'lz') {
    F.promo = 0.058;
    F.pcap = 100;
    F.pn = 'Promo Pass';
    F.mand = true;
  } else if (o.opt && o.opt[p]) {
    F.promo = o.camp ? 0.05 : 0.04;
    F.pn = p === 'sh' ? 'Mega Discount Voucher' : 'Mega Discount Program';
  }
  return F;
}

function calc(p, o) {
  const F = fees(p, o);
  const productCost = Math.max(0, o.cost || 0) * Math.max(1, o.units || 1);

  // Platform-specific expense resolution
  let pack = Math.max(0, o.pack || 0);
  let opex = Math.max(0, o.opex || 0);
  let adcost = Math.max(0, o.adcost || 0);
  let targetRoas = Math.max(0.1, o.targetRoas || 3);

  if (o.platformAllotments && o.platformAllotments[p]) {
    const allot = o.platformAllotments[p];
    if (allot.pack !== undefined && allot.pack !== null && allot.pack > 0) pack = Math.max(0, allot.pack);
    if (allot.opex !== undefined && allot.opex !== null && allot.opex > 0) opex = Math.max(0, allot.opex);
    if (allot.adCost !== undefined && allot.adCost !== null) adcost = Math.max(0, allot.adCost);
    else if (allot.adcost !== undefined && allot.adcost !== null) adcost = Math.max(0, allot.adcost);
    if (allot.targetRoas !== undefined && allot.targetRoas !== null && allot.targetRoas > 0) targetRoas = Math.max(0.1, allot.targetRoas);
  }

  const cost = productCost + pack + opex + adcost;

  const vs = o.vat ? (0.12 / 1.12) : 0;
  const k = 1 - (o.vat && o.claim ? vs : 0);
  const w = o.wht ? 0.005 : 0;
  const pt = o.vat ? 0 : 0.03;

  const evaluate = price => {
    const pr = Math.max(0, price);
    const L = [
      ['Commission (' + pe(F.comm) + ')', pr * F.comm, 0],
      [(p === 'lz' ? 'Payment fee' : 'Transaction fee') + ' (' + pe(F.trans) + ')', pr * F.trans, 0]
    ];

    if (F.growth) {
      L.push(['Seller growth fee' + (p === 'sh' ? '*' : '') + ' (' + pe(F.growth) + ')', pr * F.growth, 0]);
    }
    if (F.ship) {
      L.push(['Shipping fee (' + pe(F.ship) + ', max ₱' + F.cap + ')', Math.min(pr * F.ship, F.cap), 0]);
    }
    L.push(['Order processing fee', F.opf, 0]);
    if (F.promo) {
      L.push([F.pn + ' (' + pe(F.promo) + ', max ₱' + F.pcap + ')', Math.min(pr * F.promo, F.pcap), F.mand ? 0 : 1]);
    }

    const fe = L.reduce((a, x) => a + x[1], 0);
    const vat = pr * vs;
    const iv = fe * (1 - k);
    const wh = pr * w;
    const tx = pr * pt;
    const net = pr - vat;
    const take = pr - vat - fe + iv - wh - tx;
    const profit = take - cost;

    return {
      F,
      price: pr,
      L,
      fe,
      vat,
      iv,
      wh,
      tx,
      take,
      profit,
      cost,
      productCost,
      pack,
      opex,
      adcost,
      roas: adcost > 0 ? (pr / adcost) : null,
      maxAdSpend: targetRoas > 0 ? (pr / targetRoas) : 0,
      net,
      ded: pr - take,
      mg: net > 0 ? (profit / net) : 0,
      mk: cost > 0 ? (profit / cost) : 0
    };
  };

  if (o.srp > 0) return evaluate(o.srp);

  let low = 0;
  let high = Math.max(1, cost * 2 + F.opf + F.cap + F.pcap);
  const meetsTarget = price => {
    const r = evaluate(price);
    return r.profit - (o.m || 0) * r.net;
  };

  while (meetsTarget(high) < 0 && high < 1e9) {
    high *= 2;
  }
  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    if (meetsTarget(mid) >= 0) high = mid;
    else low = mid;
  }
  return evaluate(Math.ceil(high * 100) / 100);
}

function getStoredConfig() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveConfigToStorage(configObj) {
  try {
    const existing = getStoredConfig();
    const updated = { ...existing, ...configObj };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.warn('Storage save failed:', e);
    return false;
  }
}

function initTheme() {
  const storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(storedTheme);

  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-bs-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
  const icon = document.getElementById('themeIcon');
  const text = document.getElementById('themeText');
  if (icon && text) {
    if (theme === 'dark') {
      icon.className = 'bi bi-sun-fill text-warning';
      text.textContent = 'Light';
    } else {
      icon.className = 'bi bi-moon-stars-fill';
      text.textContent = 'Dark';
    }
  }
}
