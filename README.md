# 🇵🇭 Philippine E-Commerce Marketplace Fee & Margin Calculator

A modern, responsive multi-page web application built with **Bootstrap 5** to calculate and compare seller fees, take-home pay, net profit margins, and optimal selling prices across **Shopee Philippines**, **TikTok Shop**, and **Lazada Philippines**.

🔗 **Live GitHub Pages URL:** [https://brylimmyojin-spec.github.io/eccom.github.io/](https://brylimmyojin-spec.github.io/eccom.github.io/)

---

## 📑 Dedicated Pages & Tools

Instead of an overcrowded single page, the application is divided into dedicated, clean pages:

1. **[Pricing Simulator](index.html):** Focused simulator with cost inputs, bundle sizing, target net margin solver, fee deductions, and live visual result cards for Shopee, TikTok Shop, and Lazada.
2. **[Platform Comparison](comparison.html):** Full side-by-side economics table comparing regular SRP, campaign pricing, total deductions, take-home pay, profit, net margin, and markup, with one-click **CSV Export** and print view.
3. **[Business Profile & Allotments](profile.html):** Configure store tax registration (Non-VAT 3% vs. VAT 12%), BIR Form 2307 withholding rules, and separate per-platform ad budgets and operating overhead allotments.
4. **[Fee Reference & Rate Cards](fee-reference.html):** Comprehensive searchable and filterable database of category commissions, transaction fees, shipping caps, and official Seller Center links.
5. **[Tax & BIR Guide](tax-guide.html):** In-depth educational guide on BIR regulations (RR 16-2023 creditable 0.5% withholding tax), Non-VAT (3%), VAT-registered (12%), Output VAT formulas (`12/112`), and input VAT credits on fees.

---

## ✨ Features

- **Multi-Platform Comparison:** View Shopee, TikTok Shop, and Lazada fees and take-home pay side by side with the highest-profit platform highlighted.
- **Goal-Seek Margin Solver:** Enter your target margin (e.g., 20%), and the calculator automatically solves the exact Selling Retail Price (SRP) you need to charge.
- **Fixed Price Analysis:** Enter an exact SRP to instantly inspect deductions, take-home pay, profit, and return on ad spend.
- **Philippine Tax Model:**
  - Non-VAT Percentage Tax (3%)
  - VAT-registered Output VAT (`12/112` of gross price)
  - Optional Input VAT credit on platform fees
  - BIR Creditable Withholding Tax (0.5% per RR 16-2023)
- **All-in Cost & Expenses:** Include product cost, unit bundles, packaging cost, operating expenses, and ad spend.
- **Target ROAS Tracking:** Calculate ad spend capacity and estimated Return on Ad Spend (ROAS).
- **Comprehensive Fee Reference:** Live searchable directory of category commission rates, transaction fees, shipping caps, and official Seller Center documentation links.
- **CSV Data Export:** One-click export of comparison calculations for bookkeeping and spreadsheet analysis.
- **Unified State Across Pages:** All inputs are automatically synchronized across pages on your device via `localStorage`.
- **Dark & Light Mode:** Seamless Bootstrap 5 theme switching with system preference detection.

---

## 🚀 GitHub Pages Deployment

This repository is optimized out-of-the-box for **GitHub Pages** static site hosting:

1. **Root Entry Point:** `index.html` is located at the root of the repository.
2. **Jekyll Bypass:** `.nojekyll` is included to ensure clean, fast asset loading.
3. **Automated Actions:** `.github/workflows/deploy.yml` enables automated GitHub Pages deployments upon push to `main`.

### To Enable GitHub Pages in your Repository:
1. Navigate to **Settings** > **Pages** in your GitHub repository.
2. Under **Build and deployment** > **Source**:
   - Select **GitHub Actions** (recommended, uses the included workflow), OR
   - Select **Deploy from a branch** -> branch `main` -> folder `/ (root)`.
3. Your site will be published at `https://<username>.github.io/<repository-name>/`.

---

## 🛠️ Tech Stack

- **HTML5 & Vanilla JavaScript** (Fast, zero build dependencies, 100% static)
- **Bootstrap 5.3.3** (Responsive grid, components, and color modes)
- **Bootstrap Icons 1.11.3**
- **GitHub Pages** static hosting

---

## ⚠️ Disclaimer

Platform fee rates, commission tiers, and campaign voucher schedules are subject to change by respective marketplace operators (Shopee, TikTok Shop, Lazada). Always verify your account's applicable rate card in your official Seller Center dashboard.
