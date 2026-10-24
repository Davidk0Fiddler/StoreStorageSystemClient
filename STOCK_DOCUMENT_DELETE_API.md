# Készlettételhez kapcsolt PDF törlési API

## Cél

A frontendnek lehetővé kell tenni az árutételhez feltöltött számla- és szállítólevél-PDF-ek törlését. A dokumentumtörlés külön művelet: nem módosíthatja és nem törölheti a készlettételt.

## Végpont

```http
DELETE /api/Admin/documents/{id}
Authorization: Bearer <admin-token>
```

- `{id}` a dokumentum DTO egész számú `id` mezője.
- A kérésnek nincs body-ja.
- A végpont csak érvényes Bearer tokennel és `Admin` szerepkörrel érhető el.
- A frontend ezt az útvonalat fogja hívni az Admin Panel, az Árupanel és az árufelvétel dokumentumlistájából.

## Sikeres válasz

```http
204 No Content
```
R
A frontend a sikeres törlés után újra lekéri az adott készlettétel dokumentumlistáját:

```http
GET /api/Admin/stocks/{stockId}/documents
```

`200 OK` üres `items` listával szintén kezelhető sikeres válaszként, de a `204 No Content` az elsődlegesen várt válasz.

## Hibaválaszok

| HTTP-státusz | Jelentés |
|---|---|
| `401 Unauthorized` | Hiányzó vagy érvénytelen token |
| `403 Forbidden` | A felhasználó nem Admin |
| `404 Not Found` | Nem található a megadott dokumentum |
| `500 Internal Server Error` | A fájl vagy a dokumentumrekord törlése sikertelen |

A hibaválasz tartalmazzon a frontend számára megjeleníthető `message` mezőt.

## Elvárt törlési működés

1. A backend keresse meg a dokumentumrekordot az `id` alapján.
2. Törölje a hozzá tartozó PDF-fájlt a használt fájltárolóból.
3. Törölje az adatbázisból a dokumentumrekordot.
4. Siker esetén `204 No Content` választ adjon.
5. Ha a fájltárolóból való törlés meghiúsul, ne jelezzen hamis sikert; adjon hibaválaszt, és hagyja meg a rekordot, hogy a törlés megismételhető legyen.
6. A dokumentum törlése ne érintse a hozzá kapcsolt készlettételt.

Ha a PDF már hiányzik a fájltárolóból, de az adatbázisrekord létezik, a backend törölje az elárvult rekordot, és válaszoljon `204`-gyel.

## Backendrétegek javaslata

- **Controller:** Admin jogosultság ellenőrzése, `id` validálása, a service meghívása és a HTTP-státusz visszaadása.
- **Service:** A dokumentum létezésének ellenőrzése, a fájl és a rekord összehangolt törlése.
- **Repository:** Dokumentum keresése `id` alapján és rekord törlése.
- **Fájltároló service:** A PDF törlése a jelenlegi tárolási megoldásból.

A törlési műveletet érdemes auditnaplózni: dokumentumazonosító, fájlnév, végrehajtó Admin és időpont.
