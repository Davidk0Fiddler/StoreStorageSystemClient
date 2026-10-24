# Termékképek – backend feladatok

Ez a fájl a későbbi backend-optimalizálás feladatait tartalmazza. A jelenlegi frontend feltölti a teljes képet, megjeleníti a termékképet, tartalékképre vált hibánál, és lusta betöltést használ a listákban. A következő feladatok ehhez nem szükségesek, a képek kiszolgálását és tárolását javítják nagyobb adatmennyiségnél.

## 1. Kisméretű bélyegképek előállítása

Termékkép feltöltésekor a backend készítsen optimalizált bélyegképet az eredeti mellett. A listák kisméretű kártyáihoz és táblázataihoz a frontend ezt kérhesse le; a részletes nézet továbbra is az eredeti képet használja.

Javasolt megoldás:

- Bélyegkép legfeljebb 320×320 pixel, az eredeti képarány megőrzésével.
- WebP formátum, ha támogatott a szerveroldali képfeldolgozó; egyébként optimalizált JPEG vagy PNG.
- Az animált GIF eredeti változata maradjon elérhető; bélyegkép készítésekor az első képkocka használható.
- A fájl tartalmát továbbra is ellenőrizze a backend. A kliensoldali kiterjesztés- és méretellenőrzés nem helyettesíti a szerveroldali validációt.

## 2. Bélyegkép URL visszaadása a DTO-kban

A termék DTO-k opcionálisan adjanak vissza egy `thumbnailURL` mezőt az eredeti `imageURL` mellett. A frontend elsődlegesen ezt használja listakártyán és táblázatban, a termékrészleteknél pedig az `imageURL` maradjon az irányadó.

A mező legyen elérhető legalább az alábbi termékadat-válaszokban:

- termék részletei, keresése és SKU/vonalkód szerinti lekérése;
- terméklista, listing és selection;
- Admin terméklista és admin termék DTO;
- készletlisták és a beágyazott termék DTO-k.

Ha nincs külön bélyegkép (például régi terméknél), a backend adja vissza `null` értékkel, vagy a meglévő alapértelmezett kép URL-jét. A frontend mindkét esetben kezelni tudja.

## 3. Gyorsítótárazás és képcsere

- Minden feltöltött képcserénél kapjon az új fájl új, egyedi fájlnevet vagy verziózott URL-t. A régi URL tartalma ne változzon meg helyben, így a böngésző gyorsítótára nem mutatja tovább a korábbi képet.
- A változatlan, egyedi fájlnevekhez a kép-végpontok adjanak hosszú `Cache-Control` élettartamot, például `public, max-age=31536000, immutable`.
- A változatlan fájlnevekhez ETag vagy Last-Modified feltételes kérések is támogathatók.
- Az alapértelmezett kép végpontja (`GET /api/product-images/default`) maradjon elérhető, és adjon megfelelő tartalomtípust.

## 4. Árva fájlok biztonságos takarítása

Képcsere után a korábbi eredeti és bélyegkép csak akkor törölhető, ha egyetlen termék vagy más adat sem hivatkozik rá. A takarítás ellenőrizze a hivatkozásokat, és ne töröljön megosztott fájlt. A termékadatbázis-mentésekhez a bélyegképek tárolási helyét is vegye fel.

## Elfogadási feltételek

- Új és módosított termékhez is készül az eredeti kép mellett bélyegkép.
- A termék- és készletlisták DTO-i tartalmazzák a `thumbnailURL` mezőt anélkül, hogy az eddigi `imageURL` mező eltűnne.
- Képcsere után az API új URL-t ad vissza, ezért a kliens és a böngésző nem a régi képet tölti be.
- Hibás vagy túl nagy fájlt továbbra is a backend utasít el; a meglévő 10 MB-os korlát és tartalomellenőrzés érvényben marad.
- Az alapértelmezett kép és a meglévő termékkép-végpontok kompatibilisek maradnak.
