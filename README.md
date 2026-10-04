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

The codebase follows a **feature-sliced, DDD-inspired layout**: reusable
libraries under `src/libs/`, and business features under `src/features/`.
Features own their UI; libraries own cross-cutting concerns.

```
├── main.js                       # Electron entry point, creates the BrowserWindow
├── preload.js                    # contextBridge: exposes config.API_URL to the renderer
├── assets/                       # icons and images
└── src/
    ├── libs/                     # Shared, feature-agnostic libraries
    │   ├── domain/
    │   │   └── roles.js          # Roles + the role rules for the dashboard menu
    │   ├── data-access/          # Everything that talks to the backend
    │   │   ├── http-client.js    # fetch wrapper: base URL, auth header, response conventions
    │   │   ├── session.js        # token / userName / roleName in sessionStorage
    │   │   ├── index.js          # public surface of the layer
    │   │   └── repositories/     # One repository per bounded context
    │   │       ├── auth.repository.js
    │   │       ├── brand.repository.js
    │   │       ├── counter.repository.js
    │   │       ├── product.repository.js
    │   │       ├── product-size.repository.js
    │   │       ├── product-type.repository.js
    │   │       ├── statistics.repository.js
    │   │       ├── stock.repository.js
    │   │       └── user.repository.js
    │   └── ui/                   # Shared presentation pieces
    │       ├── alert.js          # DisplayAlert / LoadingSpinner (was duplicated 5x)
    │       ├── navigation.js     # Named routes -> relative HTML paths
    │       └── index.js
    ├── features/                 # One folder per business capability
    │   ├── loading/ui/           # Splash screen
    │   ├── auth/ui/              # Login
    │   ├── dashboard/ui/         # Role-based menu
    │   ├── counter/ui/           # POS / cashier
    │   ├── catalog/ui/           # Create products (brands, types, sizes)
    │   ├── inventory/ui/         # Stock management
    │   ├── statistics/ui/        # Income statistics (+ its panel partials)
    │   └── users/ui/             # User administration
    └── shared/styles/            # Stylesheets used across several features
```

### Layering rules

- **Features** (`src/features/*`) contain only UI and orchestration. They import
  from `libs/data-access` and `libs/ui`, and never call `fetch` directly.
- **`libs/data-access`** owns all I/O. `http-client.js` centralises the base URL,
  the bearer token and the response conventions; repositories group calls per
  bounded context.
- **`libs/domain`** holds pure business rules (role permissions) with no
  dependency on the UI or the network.
- **`libs/ui`** holds presentation helpers shared by features.

### Response conventions

The API wrappers historically returned different shapes per endpoint, and the
pages branch on those values. The conventions are preserved deliberately and
each has a named helper in `http-client.js`:

| Helper                     | Resolves                                |
| -------------------------- | --------------------------------------- |
| `getJson`                  | parsed JSON (no status check)           |
| `sendCommand`              | `true`, or the raw error text           |
| `requestJsonOrText`        | JSON on success, error text on failure  |
| `requestJsonOrFalse`       | JSON, or `false` when not found         |
| `requestValidatedJson`     | JSON, or throws with backend errors     |

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