# Admin Page – backend API szerződés

Ez a szerződés az Admin Page saját, külön kezelőpaneljeit szolgálja ki; a
frontend nem irányít át az általános Termék, Készlet vagy Profil panelekre.
Minden útvonal az `/api` alapútvonalhoz képest értendő, és kizárólag
hitelesített, `Admin` szerepkörű Bearer tokennel érhető el. A rendererben lévő
szerepkör-ellenőrzés csak navigációs védelem, nem jogosultsági határ.

A sikeres listaválaszok `{ "items": [...] }` formában érkezzenek. A hibák
lehetőleg `{ "message": "..." }` JSON választ adjanak. Minden módosítás és
státuszváltás az adatváltozással együtt, atomikusan írjon AuditLog bejegyzést:
ki, mit, melyik entitáson, mikor, előtte és utána milyen értékkel.

## Termékek

`GET /Admin/products?search={szöveg}`

Az `items` mező termékei tartalmazzák: `sku`, `productName`, `barcode`, `brand`,
`productType`, `productSize`, `imageURL`, `hasDeposit`, `depositAmount`,
`isActive`.

`PUT /Admin/products/{sku}`

JSON törzs: `productName`, `barcode`, `brand`, `productType`, `productSize`,
`imageURL`, `hasDeposit`, `depositAmount`. Az SKU módosíthatatlan útvonal-azonosító.

`PATCH /Admin/products/{sku}/status`

JSON törzs: `{ "isActive": true | false }`.

## Áruk (készletbevételezési tételek)

`GET /Admin/stocks?search={szöveg}`

Az `items` mező tételei tartalmazzák: `stockId`, `productName`, `sku`,
`productSize`, `quantity`, `shopQuantity`, `currentPrice`, `importPrice`,
`expirationDate`, `invoiceId`, `transitId`, `isActive`. A termékadatok lehetnek
közvetlenül a tételen vagy `product` nevű beágyazott objektumban.

`PUT /Admin/stocks/{stockId}`

JSON törzs: `quantity`, `shopQuantity`, `currentPrice`, `importPrice`,
`expirationDate`, `invoiceId`, `transitId`.

`PATCH /Admin/stocks/{stockId}/status`

JSON törzs: `{ "isActive": true | false }`.

## Profilok

`GET /Admin/profiles?search={szöveg}`

Az `items` mező profiljai tartalmazzák: `userName`, `roleId`, `roleName`,
`isActive`, `createdAt`.

`PUT /Admin/profiles/{jelenlegiFelhasználónév}`

JSON törzs: `{ "oldUserName": "...", "userName": "...", "roleId": 1 }`.
Szerepkör-azonosítók: `1 = Admin`, `2 = Counter`, `3 = Storage`.

`PATCH /Admin/profiles/{userName}/status`

JSON törzs: `{ "isActive": true | false }`.

## Naplók

Mindhárom naplólistázó végpont fogadja a `from`, `to`, `page` és `pageSize`
paramétereket. A dátumformátum `YYYY-MM-DD`. A válasz mezői: `items`,
`totalCount`, `page`, `pageSize`, `pageCount`.

- `GET /Admin/logs/shop` — mezők: `id`, `dateTime`, `userName`, `productsCount`,
  `totalPrice`.
- `GET /Admin/logs/audit` — mezők: `id`, `createdAt`, `actorUserName`, `action`,
  `entityType`, `entityId`, `before`, `after`.
- `GET /Admin/logs/storage-movements` — mezők: `id`, `createdAt`, `userName`,
  `productName`, `stockId`, `quantity`, `unit`.

A napló részletei a listaválaszban érkezzenek, mert a frontend a kiválasztott
bejegyzés teljes objektumát jeleníti meg. A backend korlátozza a `pageSize`
értékét (a kliens 25-öt kér), és validálja a dátumtartományt és lapozást.

## Jogosultság és hibaválaszok

- Hiányzó vagy érvénytelen hitelesítésre `401`, nem admin felhasználóra `403`
  válasz szükséges minden végpontnál.
- A rendereroldali Admin Page elrejtése nem helyettesíti a szerveroldali
  jogosultság-ellenőrzést.
- Hibás értékekre `400`, nem létező azonosítóra `404`, ütköző SKU-ra vagy
  felhasználónévre `409` választ adjunk.
- A termék-, áru- és profilmódosítások, illetve státuszváltások AuditLog
  eseményt írjanak; az AuditLog tartalmazza az előtte/utána állapotot.
- Ne lehessen az aktuális munkamenet egyetlen aktív Admin profilját deaktiválni,
  és a backend utasítsa el az utolsó aktív Admin szerepkör megszüntetését.
