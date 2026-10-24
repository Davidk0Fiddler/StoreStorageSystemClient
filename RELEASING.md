# Windows-kiadás és automatikus frissítés

## A frissítési folyamat

- A Windowsos kiadás NSIS telepítőként készül.
- Az alkalmazás induláskor a `package.json` verzióját és a GitHub Release-t ellenőrzi.
- Ha új verzió érhető el, az indítóképernyőn a **Frissítés** gomb jelenik meg. A letöltés végén az alkalmazás telepíti az új verziót és újraindul.
- Ha a GitHub vagy az internet nem érhető el, az **Indulás** gombbal a jelenlegi verzió használható.
- Az első telepítéshez updaterrel együtt összeállított telepítő szükséges. A korábban updater nélkül telepített klienst egyszer kézzel kell lecserélni erre az első kiadásra.

## Egyszeri GitHub-beállítások

1. A `package.json` jelenleg a `Davidk0Fiddler/StoreStorageSystemClient` repót használja frissítési forrásként. A kliens token nélkül tölti le a nyilvános Release-eket, ezért ennek a repónak nyilvánosnak kell lennie.
   - Ha a forráskódot privátan szeretnéd tartani, hozz létre egy külön nyilvános frissítési repót, és szólj, hogy átállítsam rá a kiadási konfigurációt.
2. A GitHub repóban nyisd meg: **Settings → Secrets and variables → Actions → Variables → New repository variable**.
3. Hozd létre a `STORE_API_URL` változót az éles backend teljes HTTPS-címével, például `https://api.example.com/api` formában. Ez publikus klienskonfiguráció, ne tartalmazzon jelszót vagy tokent.
4. A kiadási workflow a GitHub Actions beépített `GITHUB_TOKEN` jogosultságát használja `GH_TOKEN`-ként, ezért ehhez nem kell személyes hozzáférési tokent a kliensbe tenni.

## Első kiadás: `1.0.0`

1. Ellenőrizd, hogy a `package.json` verziója `1.0.0`.
2. Commitold és pushold a kiadáshoz szükséges forrásfájlokat, beleértve a `.github/workflows/release.yml` fájlt, a `package.json`-t és a `package-lock.json`-t.
3. Hozd létre és pushold a `v1.0.0` címkét a frissítőkonfigurációt már tartalmazó commiton. A push elindítja a GitHub Actions kiadási folyamatot.
4. A **Actions** lapon várd meg, amíg a Windows-kiadás sikeresen lefut. A folyamat elkészíti és a GitHub Release-hez csatolja a telepítőt, a `latest.yml` metaadatot és a differenciális frissítés fájljait.
5. Telepítsd a Release-ből a `Store Storage System Setup 1.0.0.exe` fájlt az első gépen.

## Későbbi frissítés

1. Emeld a `package.json` verzióját, például `1.0.0`-ról `1.0.1`-re. A Git tag verziója egyezzen a `package.json` verziójával.
2. Commitold és pushold a módosítást, majd pusholj egy `v1.0.1` címkét.
3. A GitHub Actions elkészíti és közzéteszi az új kiadást. A már telepített `1.0.0` kliens következő indításakor felajánlja a **Frissítés** gombot.

## Helyi telepítő készítése

PowerShellben, a projekt gyökeréből:

```powershell
npm ci
npm run build:win
```

A kész telepítő a `release/` mappába kerül. A parancs a lokális `.env` fájlból olvassa az `API_URL` értéket; ha hiányzik vagy nem HTTPS-cím, a kiadás megáll.

## Fontos megkötések

- A frissítés Windows x64, telepített NSIS alkalmazásra van beállítva. A `npm start` fejlesztői futtatás nem ellenőrzi a frissítéseket.
- A verziószámot kiadások között mindig növeld. Már közzétett verzióhoz ne tölts fel eltérő telepítőt ugyanazzal a verziószámmal.
- A frissítés tárhelyének repo-nevét és tulajdonosát tartsd állandóan; az updater ezt az első telepítéskor beégeti a csomagba.
- Aláíratlan Windows telepítőnél a Windows SmartScreen figyelmeztethet.
