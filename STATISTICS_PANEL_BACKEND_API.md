# Statistics Panel – backend API specifikáció

Ez a dokumentum a frontend öt statisztikai paneljéhez szükséges backend-adatokat írja le. A javasolt útvonalak a meglévő `/Statistics/...` útvonalcsaládot követik; a backend csapat ezeket a saját routing-konvencióihoz igazíthatja.

## Jogosultság és közös szabályok

- **Minden itt felsorolt végpont csak `Admin` szerepkörrel legyen elérhető.** A jogosultságot a backend ellenőrizze minden kérésnél, a hitelesített felhasználó tokenje/claimje alapján. A frontend oldali menüelrejtés önmagában nem jogosultságvédelem.
- Nem admin felhasználó kapjon `403 Forbidden` választ; hiányzó/érvénytelen hitelesítés esetén `401 Unauthorized` választ.
- Dátumparaméter: ISO `YYYY-MM-DD`; időbélyeg: ISO 8601, lehetőleg UTC (`...Z`). A napi/havi csoportosítás a bolt beállított időzónájában történjen, ne a kliens gépének időzónájában.
- Pénzösszegek: numerikus HUF értékek, kerekítési szabály egységesen a backendben. Ne formázott szövegként (pl. `"12 500 Ft"`) érkezzenek.
- Mennyiségekhez kötelező a termék egysége (`db`, `kg`, `g`, `l`, `ml` stb.). Különböző egységek mennyiségeit ne adjuk össze egyetlen számmá; a `kg` értékeket összehasonlításkor lehet numerikusan kezelni, de a válasz őrizze meg a valódi egységet.
- Üres időszak esetén sikeres, nulla értékeket és üres listákat adó választ küldjön a backend, ne hibát vagy statikus mintaszámokat.

## 1. Bevételek

### `GET /Statistics/total-income`

Az összes rögzített értékesítés összesített bevétele.

```json
{
  "grossRevenue": 1250000,
  "salesCount": 214,
  "currency": "HUF"
}
```

### `GET /Statistics/daily-income?date=YYYY-MM-DD`

Az adott nap bevételi összesítése és a vásárlások listája. Ezt a panel a mai összeghez, a napi grafikonhoz és a vásárlás részleteinek megnyitásához használja.

```json
{
  "date": "2026-10-12",
  "grossRevenue": 125000,
  "salesCount": 18,
  "shopLogs": [
    {
      "id": 901,
      "dateTime": "2026-10-12T14:32:10Z",
      "totalPrice": 8450,
      "productsCount": 4
    }
  ]
}
```

### `GET /Statistics/weekly-income?date=YYYY-MM-DD`

Az `date` napját tartalmazó hét napi idősora, a bolt időzónája szerinti hétkezdettel.

```json
{
  "date": "2026-10-12",
  "grossRevenue": 740000,
  "dailyIncome": [
    { "date": "2026-10-12", "grossRevenue": 125000, "salesCount": 18 }
  ]
}
```

### `GET /Statistics/monthly-income?date=YYYY-MM-DD`

Az `date` hónapjának napi idősora. Minden hónapnap szerepelhet `grossRevenue: 0` értékkel, vagy a frontend töltheti fel a hiányzó napokat nullával.

```json
{
  "date": "2026-10-12",
  "grossRevenue": 3100000,
  "dailyIncome": [
    { "date": "2026-10-01", "grossRevenue": 90000, "salesCount": 13 }
  ]
}
```

### `GET /Statistics/yearly-income?date=YYYY-MM-DD`

Az `date` évének havi idősora.

```json
{
  "date": "2026-10-12",
  "grossRevenue": 27500000,
  "monthlyIncome": [
    { "month": "2026-01", "grossRevenue": 2100000, "salesCount": 320 }
  ]
}
```

## 2. Top termékek

### `GET /Statistics/productpurchase?from=YYYY-MM-DD&to=YYYY-MM-DD`

Az időszakban eladott termékek aggregátuma. A meglévő végpont jelenleg időszak nélkül szerepel a frontendben; kérjük, támogassa a dátumszűrést. A válasz tartalmazza a megjelenítéshez szükséges termékadatokat is, hogy ne kelljen minden sort külön katalógus-végponttal összefűzni.

```json
[
  {
    "sku": "MILK-001",
    "productName": "Tej",
    "description": "2,8%-os tej",
    "brand": "Példa márka",
    "productType": "Tejtermék",
    "unit": "l",
    "soldQuantity": 125.5,
    "salesCount": 90,
    "grossRevenue": 62500
  }
]
```

Az összesített darabszámot és terméktípus-bontást a frontend kiszámíthatja ebből a válaszból. A mennyiség az értékesítési sorok tényleges egységében legyen megadva.

## 3. Márkák

### `GET /Statistics/brand-sales?from=YYYY-MM-DD&to=YYYY-MM-DD`

A márkák rangsora és a kiválasztott márkához tartozó eladott termékek. Az időszakban nem értékesítő márkák is szerepelhetnek `soldQuantity: 0` értékkel, ha a panel teljes márkalistát mutat.

```json
[
  {
    "brandId": 12,
    "brandName": "Példa márka",
    "products": [
      { "sku": "MILK-001", "productName": "Tej", "unit": "l", "soldQuantity": 125.5 }
    ],
    "totalsByUnit": [
      { "unit": "l", "quantity": 125.5 }
    ]
  }
]
```

A toplista összehasonlító pontszáma lehet a mennyiségek numerikus összege, de az egységenkénti összegeket külön kell visszaadni/megjeleníteni. A jelenlegi frontend ezt a rangsorolást végzi.

## 4. Tranzakciók

### `GET /Statistics/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&page=1&pageSize=50&type=all`

Egyesített, időrendi pénzmozgáslista: bolti értékesítések (bevétel) és árubevételezések (kiadás). Ez váltaná ki a frontend jelenlegi havi, napi bontású sokas API-hívását és a készlettételek egyenkénti részletlekérését.

```json
{
  "from": "2026-10-01",
  "to": "2026-10-31",
  "summary": {
    "grossRevenue": 3100000,
    "grossPurchases": 1850000,
    "balance": 1250000,
    "salesCount": 420,
    "stockReceiptCount": 24
  },
  "dailyTotals": [
    { "date": "2026-10-01", "grossRevenue": 90000, "grossPurchases": 0 }
  ],
  "items": [
    {
      "id": "sale-901",
      "type": "income",
      "dateTime": "2026-10-12T14:32:10Z",
      "description": "Értékesítés #901",
      "quantity": 4,
      "unit": "db",
      "netAmount": 6653.54,
      "vatAmount": 1796.46,
      "vatRate": 27,
      "grossAmount": 8450,
      "currency": "HUF"
    },
    {
      "id": "stock-44",
      "type": "expense",
      "dateTime": "2026-10-11T08:00:00Z",
      "description": "Tej – árubevételezés",
      "quantity": 50,
      "unit": "l",
      "netAmount": 25000,
      "vatAmount": 6750,
      "vatRate": 27,
      "grossAmount": 31750,
      "currency": "HUF"
    }
  ],
  "page": 1,
  "pageSize": 50,
  "totalCount": 444
}
```

Követelmények:

- `type` csak `income` vagy `expense` legyen; a kiadások készlet/árubevételezési eseményből származzanak, ne a készlet aktuális állapotából.
- A beszerzési összeg az adott bevételezéskori mennyiségből, nettó egységárból és mentett ÁFA-kulcsból álljon össze. Ne az aktuális termékárból számolódjon visszamenőleg.
- A rendezés `dateTime` szerint csökkenő legyen. A `summary` és `dailyTotals` a teljes dátumtartományra vonatkozzon, ne csak az aktuális lapra.
- A `grossAmount` legyen az az összeg, amit a bolt ténylegesen bevételként/kiadásként rögzített. Visszáru, sztornó vagy korrekció esetén a backend dokumentálja, hogy külön tranzakcióként vagy negatív összegként jelenik-e meg.

## 5. ÁFA

### `GET /Statistics/vat?from=YYYY-MM-DD&to=YYYY-MM-DD`

Az értékesítésben felszámított (output) és a beszerzésekben szereplő (input) ÁFA összesítése. Ez teszi lehetővé, hogy a panel a bevételhez viszonyítva, és lehetőség szerint kulcsonként ábrázolja az ÁFÁ-t.

```json
{
  "from": "2026-10-01",
  "to": "2026-10-31",
  "grossRevenue": 3100000,
  "netRevenue": 2600000,
  "outputVat": 500000,
  "inputVat": 280000,
  "vatByRate": [
    {
      "rate": 27,
      "salesNetAmount": 1000000,
      "salesVatAmount": 270000,
      "salesGrossAmount": 1270000,
      "salesQuantityByUnit": { "db": 80, "kg": 12.5 },
      "purchaseNetAmount": 400000,
      "purchaseVatAmount": 108000,
      "purchaseGrossAmount": 508000
    }
  ],
  "dailyTotals": [
    { "date": "2026-10-01", "grossRevenue": 90000, "outputVat": 14500, "inputVat": 0 }
  ],
  "currency": "HUF"
}
```

Az értékesítési ÁFA-t az eladás pillanatában rögzített terméksor nettó/bruttó értékéből és ÁFA-kulcsából kell számítani. **Ne a termék jelenlegi ÁFA-kulcsát használd történelmi eladásokhoz.** Ha a backend nem tudja megbízhatóan előállítani az értékesítési ÁFA-t, adja vissza `null` értékként és jelezze az adat hiányát; ne becsülje jogszabályi kulcsból. Az input és output ÁFA külön mező maradjon. Az esetleges fizetendő/levonható egyenleg adózási szabályoktól függ, ezért csak külön egyeztetett üzleti szabály után kerüljön a válaszba.

## Meglévő végpontok és átállás

A jelenlegi frontend ezeket használja: `/Statistics/total-income`, `/Statistics/daily-income`, `/Statistics/weekly-income`, `/Statistics/monthly-income`, `/Statistics/yearly-income`, `/Statistics/productpurchase`, `/Shoplogs/{id}`, `/Stocks/listing`, `/Stocks/{id}`, `/Brands`, `/Products/listing`. A fenti specifikáció ezek meglévő használatát összehangolja, valamint javasolja a tranzakciós és ÁFA riport végpontokat, hogy a kliensnek ne kelljen havi 28–31 napi kérést és sok készlettétel-részletkérést indítania.

Az Admin policy minden felsorolt `/Statistics/...` végpontra, illetve a panelhez használt tranzakciós/termékadat-végpontokra is vonatkozzon, ha azok admin-statisztikai adatot adnak vissza. A meglévő általános `/Products`, `/Brands`, `/Stocks`, `/Shoplogs` erőforrások jogosultsági szabályait ne gyengítsük; ahol azok más szerepköröknek is kellenek, ott a statisztikai lekérdezések külön Admin-védett végpontot kapjanak.
