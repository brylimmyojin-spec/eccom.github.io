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
    nonrecoverableAdVat: true, // 12% VAT on digital advertising when nonrecoverable
    defaultMargin: 20,
    packagingCost: 0,
    sourcingFreight: 0, // Inbound sourcing & logistics freight cost per unit (supplier to warehouse)
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
  const units = Math.max(1, o.units || 1);
  const baseItemCost = Math.max(0, o.cost || 0);
  const unitFreight = Math.max(0, o.freight !== undefined ? o.freight : (o.sourcingFreight !== undefined ? o.sourcingFreight : (o.shippingCost || 0)));

  const baseProductCost = baseItemCost * units;
  const sourcingFreight = unitFreight * units;
  const landedCost = baseProductCost + sourcingFreight;

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

  const cost = landedCost + pack + opex + adcost;

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

    // Advertising VAT treatment (from ROAS Computation Guide)
    const nonrecoverableAdVat = (o.nonrecoverableAdVat !== undefined) ? 
      (o.nonrecoverableAdVat === true) : 
      (!o.vat || !o.claim);
    const adVatRate = nonrecoverableAdVat ? 0.12 : 0;
    const adVatMultiplier = 1 + adVatRate; // 1.12 if 12% nonrecoverable, 1.00 if creditable

    const nonAdCost = landedCost + pack + opex;
    const preVatAdSpend = adcost;
    const totalAdCost = preVatAdSpend * adVatMultiplier;
    const cost = nonAdCost + totalAdCost;

    const fe = L.reduce((a, x) => a + x[1], 0);
    const vat = pr * vs;
    const iv = fe * (1 - k);
    const wh = pr * w;
    const tx = pr * pt;
    const net = pr - vat;
    const take = pr - vat - fe + iv - wh - tx;
    const profit = take - cost;

    // --- Official ROAS Computation Guide Formulas ---
    // 2. Contribution per order and Contribution Margin:
    const contributionPerOrder = take - nonAdCost;
    const contributionMargin = net > 0 ? (contributionPerOrder / net) : 0;

    // 3. Break-Even ROAS before advertising VAT:
    const breakEvenRoasBase = contributionMargin > 0 ? (1 / contributionMargin) : null;

    // 4. Break-Even ROAS with nonrecoverable ad VAT (1.12 / CM):
    const breakEvenRoasVatAdjusted = contributionMargin > 0 ? (1.12 / contributionMargin) : null;
    const breakEvenRoas = nonrecoverableAdVat ? breakEvenRoasVatAdjusted : breakEvenRoasBase;

    // Break-even allowable pre-VAT ad spend per order:
    const breakEvenAdSpend = contributionPerOrder > 0 ? (contributionPerOrder / adVatMultiplier) : 0;

    // 7. Target ROAS: (1 + nonrecoverable ad VAT rate) / [(Contribution - Desired profit) / Net selling revenue]
    const desiredProfitPerOrder = net * (o.m || 0);
    const marginBuffer = contributionMargin - (o.m || 0);
    const targetRoasCalculated = marginBuffer > 0 ? (adVatMultiplier / marginBuffer) : null;
    const maxAdSpendAtTarget = Math.max(0, (contributionPerOrder - desiredProfitPerOrder) / adVatMultiplier);

    // 1 & 6. Actual ROAS and Profit Contribution:
    const actualRoas = preVatAdSpend > 0 ? (pr / preVatAdSpend) : null;
    const profitContributionAfterAds = contributionPerOrder - totalAdCost;

    // ROAS Health Evaluation
    let roasHealth = 'none';
    let roasHealthLabel = 'No Ads Entered';
    let roasBadgeClass = 'bg-secondary-subtle text-secondary-emphasis';

    if (contributionPerOrder <= 0) {
      roasHealth = 'negative';
      roasHealthLabel = 'Negative Pre-Ad Margin';
      roasBadgeClass = 'bg-danger text-white';
    } else if (preVatAdSpend > 0) {
      if (preVatAdSpend > breakEvenAdSpend) {
        roasHealth = 'loss';
        roasHealthLabel = 'Losing Money on Ads (ROAS < BE)';
        roasBadgeClass = 'bg-danger-subtle text-danger-emphasis border border-danger-subtle';
      } else if (Math.abs(preVatAdSpend - breakEvenAdSpend) < 0.1) {
        roasHealth = 'breakeven';
        roasHealthLabel = 'Break-Even (₱0 Net)';
        roasBadgeClass = 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      } else if (targetRoasCalculated && actualRoas >= targetRoasCalculated) {
        roasHealth = 'optimal';
        roasHealthLabel = 'Target Margin Met (Scalable)';
        roasBadgeClass = 'bg-success-subtle text-success-emphasis border border-success-subtle';
      } else {
        roasHealth = 'profitable';
        roasHealthLabel = 'Profitable (< Target Margin)';
        roasBadgeClass = 'bg-info-subtle text-info-emphasis border border-info-subtle';
      }
    }

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
      nonAdCost,
      baseProductCost,
      sourcingFreight,
      landedCost,
      productCost: landedCost,
      pack,
      opex,
      adcost: preVatAdSpend,
      totalAdCost,
      nonrecoverableAdVat,
      adVatRate,
      adVatMultiplier,
      contributionPerOrder,
      contributionMargin,
      preAdProfit: contributionPerOrder,
      preAdMargin: contributionMargin,
      breakEvenRoasBase,
      breakEvenRoasVatAdjusted,
      breakEvenRoas,
      breakEvenAdSpend,
      targetRoasCalculated,
      maxAdSpendAtTarget,
      actualRoas,
      realizedRoas: actualRoas,
      roas: actualRoas,
      profitContributionAfterAds,
      maxAdSpend: maxAdSpendAtTarget > 0 ? maxAdSpendAtTarget : (targetRoas > 0 ? (pr / targetRoas) : 0),
      roasHealth,
      roasHealthLabel,
      roasBadgeClass,
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
