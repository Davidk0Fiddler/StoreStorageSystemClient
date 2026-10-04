# StoreStorageSystemClient

Electron desktop client for a store storage / inventory management system.
Handles the cashier (POS) counter, stock management, and income statistics,
talking to a separate backend API.

## Features

- **Login** – JWT-based authentication; the token is kept in `sessionStorage`.
- **Role-based menu** – `Admin`, `Counter`, and `Storage` roles each see different panels.
- **Kassza (Counter / POS)** – product lookup by barcode or SKU, cart, purchase saving.
- **Áru (Stock) & Add Stock** – create, update, activate/deactivate products, brands,
  product types and product sizes.
- **Statisztika** – daily / weekly / monthly / yearly income charts (Chart.js),
  top products, brand breakdown, transactions and VAT.

## Tech stack

| Concern      | Choice                                        |
| ------------ | --------------------------------------------- |
| Shell        | [Electron](https://www.electronjs.org/) `^42` |
| Renderer     | Plain HTML / CSS / ES modules                 |
| UI library   | Bootstrap 5.3 + Bootstrap Icons               |
| Charts       | Chart.js (loaded from CDN)                    |
| Secrets      | `dotenv`                                      |

Pages are plain HTML files loaded into the main window via `window.location.href`.
All backend calls live in `scripts/api/` as small single-purpose modules.

## Project structure

```
├── main.js                 # Electron entry point, creates the BrowserWindow
├── preload.js              # contextBridge: exposes config.API_URL to the renderer
├── assets/                 # icons and images
├── pages/                  # One folder per screen (HTML + JS + CSS)
│   ├── LoadingPage/        # Splash screen
│   ├── LoginPage/          # Authentication
│   ├── LandingPage/        # Role-based menu
│   ├── CounterPage/        # POS / cashier
│   ├── AddStockPage/       # Create products
│   ├── StockPanel/         # Stock management
│   ├── StatisticsPanel/    # Income statistics
│   └── ProfilPanel/        # User profile
└── scripts/api/            # One module per backend endpoint
```

## Requirements

- [Node.js](https://nodejs.org/) 18 or newer
- A running instance of the backend API

## Getting started

```bash
npm install
```

Copy the example environment file and point it at your backend:

```bash
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

```env
API_URL=https://localhost:7227/api
```

Then launch the app:

```bash
npm start
```

## Configuration

| Variable  | Required | Description                          |
| --------- | -------- | ------------------------------------ |
| `API_URL` | yes      | Base URL of the backend API.         |

`.env` is git-ignored — it is machine-specific and should never be committed.

## Security notes

The renderer runs with `contextIsolation: true` and `nodeIntegration: false`.
Only `API_URL` is bridged to the page. The backend is expected to run over
HTTPS with a trusted certificate, since the client targets `https://` URLs.