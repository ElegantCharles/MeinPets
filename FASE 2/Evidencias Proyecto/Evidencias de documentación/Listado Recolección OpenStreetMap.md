# Lugares capturados de OpenStreetMap (región de Valparaíso)

Evidencia medición de establecimientos en OpenStreetMap y alineación de categorías.

- **Fuente:** OpenStreetMap, vía Overpass API. © OpenStreetMap contributors, licencia ODbL.
- **Fecha de captura:** 2026-11-16 23:02:21 UTC.
- **Zona:** Región de Valparaíso, buscada con `area(3600198847)`.
- **Total capturado:** 185 elementos.

## Resumen

| Tipo | Capturados | Sin repetidos | Con calle | Con teléfono |
|---|---|---|---|---|
| Veterinarias | 88 | 86 | 55 | 11 |
| Tiendas de mascotas | 80 | 79 | 44 | 6 |
| Peluquerías | 13 | 13 | 9 | 3 |
| Laboratorios veterinarios | 0 | 0 | 0 | 0 |
| Farmacias veterinarias | 4 | 4 | 2 | 1 |

«Sin repetidos»: se restan los lugares dibujados dos veces (mismo nombre a menos de 150 m). «Con calle»: trae `addr:street`.

## Consulta Overpass

```
[out:json][timeout:240];
area(3600198847)->.region;
(
  nwr["amenity"="veterinary"](area.region);
  nwr["shop"="pet"](area.region);
  nwr["shop"="animal_feed"](area.region);
  nwr["shop"="pet_grooming"](area.region);
  nwr["shop"="hairdresser"]["name"~"canin|mascota|pet|groom",i](area.region);
  nwr["healthcare"="laboratory"](area.region);
  nwr["amenity"="pharmacy"]["name"~"veterin",i](area.region);
  nwr["amenity"="veterinary_pharmacy"](area.region);
);
out center tags;
```

## Veterinarias (88)

Etiqueta: `amenity=veterinary`. Se cargan como `veterinaria`.

| # | Nombre | OSM | Dirección | Teléfono | Nota |
|---|---|---|---|---|---|
| 1 | Acti Vet | [w1006834377](https://www.openstreetmap.org/way/1006834377) | Avenida Valparaíso 324, Villa Alemana | sí |  |
| 2 | Aires | [w974167876](https://www.openstreetmap.org/way/974167876) | Avenida Valparaíso 1649, Villa Alemana | no |  |
| 3 | Animaland | [w1000902916](https://www.openstreetmap.org/way/1000902916) | Arrieta 8, Villa Alemana | no |  |
| 4 | Animalife | [w422698835](https://www.openstreetmap.org/way/422698835) | Avenida Blanco Encalada 1520, Quilpué | no |  |
| 5 | AsísVet | [w1025985649](https://www.openstreetmap.org/way/1025985649) | Lo Gamboa 282, Quilpué | no |  |
| 6 | Avansavet | [w749001382](https://www.openstreetmap.org/way/749001382) | 2 Norte 930, Viña del Mar | no |  |
| 7 | BaronVet | [n13962963066](https://www.openstreetmap.org/node/13962963066) | Blanco Viel 296 | sí |  |
| 8 | Caringvet | [n12092463600](https://www.openstreetmap.org/node/12092463600) | Avenida Costa de Montemar 264, Concón | no |  |
| 9 | Carol Pets | [n14209410627](https://www.openstreetmap.org/node/14209410627) | Zapallar 2115 | no |  |
| 10 | Central Veterinaria | [w923085566](https://www.openstreetmap.org/way/923085566) | Avenida Los Carrera 0100, Quilpué | no |  |
| 11 | Centro de Diagnóstico Veterinario Quilpué | [w599953583](https://www.openstreetmap.org/way/599953583) | Avenida Ramón Freire 1370, Quilpué | no |  |
| 12 | Centro Integral de Mascotas | [w713812125](https://www.openstreetmap.org/way/713812125) | — | no |  |
| 13 | Centro León | [n10079106200](https://www.openstreetmap.org/node/10079106200) | Avenida República 18, Limache | sí |  |
| 14 | Centro Veterinario Doctor Enrique Gutiérrez | [w410099291](https://www.openstreetmap.org/way/410099291) | Avenida Los Carrera 341, Quilpué | no |  |
| 15 | Centro Veterinario El Tabo | [n11495565918](https://www.openstreetmap.org/node/11495565918) | Arellano 1457, El Tabo | no |  |
| 16 | Centro Veterinario Recreo | [n5009891126](https://www.openstreetmap.org/node/5009891126) | — | no |  |
| 17 | Cequivet | [n9661752875](https://www.openstreetmap.org/node/9661752875) | 3 Norte 1230, Viña del Mar | no |  |
| 18 | Clínica Veterinaria Dra. Dolly | [n6000329055](https://www.openstreetmap.org/node/6000329055) | — | no |  |
| 19 | Clínica Veterinaria i.vet mas.cota | [n11610001541](https://www.openstreetmap.org/node/11610001541) | Alonso de Quintero 264 | no |  |
| 20 | Clínica Veterinaria La Cruz | [w889335618](https://www.openstreetmap.org/way/889335618) | 21 de Mayo 5310, La Cruz | no |  |
| 21 | Clínica Veterinaria Los Castaños | [w644878887](https://www.openstreetmap.org/way/644878887) | Quillota 156, Viña del Mar | no |  |
| 22 | Clínica Veterinaria Los Castaños | [w1047316149](https://www.openstreetmap.org/way/1047316149) | Avenida Los Carrera 1130, Quilpué | no |  |
| 23 | Clínica Veterinaria Peñablanca | [n4511215230](https://www.openstreetmap.org/node/4511215230) | Presbítero Eduardo Lecourt 12, Villa Alemana | sí |  |
| 24 | Clínica Veterinaria Pet House | [n5700173558](https://www.openstreetmap.org/node/5700173558) | Avenida Concón Reñaca 3400, Concón | no |  |
| 25 | Clínica Veterinaria Punto de Mascota | [w567265533](https://www.openstreetmap.org/way/567265533) | Avenida Carlos Ibáñez del Campo 1, Viña del Mar | sí |  |
| 26 | Clinica Veterinaria Reñaca | [n9294872597](https://www.openstreetmap.org/node/9294872597) | — | sí |  |
| 27 | Clinica Veterinaria San Sebastián | [n11839502862](https://www.openstreetmap.org/node/11839502862) | Prat 12, Quillota | no |  |
| 28 | Clínica y Farmacia Veterinaria Sevet | [w567275593](https://www.openstreetmap.org/way/567275593) | Avenida Carlos Ibáñez del Campo 1, Viña del Mar | sí |  |
| 29 | ClubPets | [n8301556467](https://www.openstreetmap.org/node/8301556467) | Manuel Montt 419, Villa Alemana | no | también tienda |
| 30 | Conzoolvet | [w711109162](https://www.openstreetmap.org/way/711109162) | — | no |  |
| 31 | Diquivet | [n12461969842](https://www.openstreetmap.org/node/12461969842) | Avenida Palmira Romano Norte 910, Limache | no |  |
| 32 | DiquiVet | [n14313434931](https://www.openstreetmap.org/node/14313434931) | Avenida Eastman 1683 | no |  |
| 33 | Dr. Gustavo Mardones Gagliano | [w1006834387](https://www.openstreetmap.org/way/1006834387) | Avenida Valparaíso 176, Villa Alemana | no |  |
| 34 | Dr. Pet | [n13378400472](https://www.openstreetmap.org/node/13378400472) | Ruta de la Fruta 1, Santo Domingo | no |  |
| 35 | Espacio Pet | [w1007360146](https://www.openstreetmap.org/way/1007360146) | Baquedano 813, Villa Alemana | no |  |
| 36 | Gorki | [n13788185357](https://www.openstreetmap.org/node/13788185357) | — | no |  |
| 37 | Hospital Clínico Veterinario EmilyPet | [n11250078759](https://www.openstreetmap.org/node/11250078759) | — | no | hospital |
| 38 | Hospital Clinico Veterinario Quillota | [n5007382330](https://www.openstreetmap.org/node/5007382330) | — | no | hospital |
| 39 | Hospital Clínico Veterinario Santo Tomás | [w639494289](https://www.openstreetmap.org/way/639494289) | 1 Norte 1713, Viña del Mar | no | hospital |
| 40 | Hospital Clínico Veterinario UVM | [w1161197339](https://www.openstreetmap.org/way/1161197339) | — | no | hospital |
| 41 | Hospital Clínico Veterinario UVM | [w1161215446](https://www.openstreetmap.org/way/1161215446) | — | no | repetido de w1161197339; hospital |
| 42 | Hospital Clínico Veterinario UVM | [r15705583](https://www.openstreetmap.org/relation/15705583) | — | no | repetido de w1161197339; hospital |
| 43 | Hospital Veterinario Algarrobo | [w1384244299](https://www.openstreetmap.org/way/1384244299) | Santa Teresita 2467, Algarrobo | no | hospital |
| 44 | Hospital Veterinario El Quisco | [n11499112248](https://www.openstreetmap.org/node/11499112248) | Avenida Isidoro Dubournais, El Quisco | no | hospital |
| 45 | Imipet | [n2153460825](https://www.openstreetmap.org/node/2153460825) | — | no |  |
| 46 | Isavet | [w1039075543](https://www.openstreetmap.org/way/1039075543) | Avenida Valparaíso 1534, Villa Alemana | no |  |
| 47 | Kleintiere | [w717000316](https://www.openstreetmap.org/way/717000316) | Pudeto 196, Villa Alemana | no |  |
| 48 | La Casa de Lupe | [n13522916624](https://www.openstreetmap.org/node/13522916624) | Avenida Ignacio Carrera Pinto, Algarrobo | no |  |
| 49 | Mascotas Curauma | [n14024945587](https://www.openstreetmap.org/node/14024945587) | Avenida Obispo Valdés Subercaseaux 1421, Curauma | no |  |
| 50 | Mascotas VIP | [n4511215233](https://www.openstreetmap.org/node/4511215233) | — | no |  |
| 51 | Mascotavet | [n13524772603](https://www.openstreetmap.org/node/13524772603) | Avenida Isidoro Dubournais, El Quisco | no |  |
| 52 | Master Vet | [n4382778442](https://www.openstreetmap.org/node/4382778442) | — | no |  |
| 53 | Mobyd | [n2100773807](https://www.openstreetmap.org/node/2100773807) | Cardenal Raúl Silva Henríquez 1225, San Antonio | no |  |
| 54 | Motitas | [w605653721](https://www.openstreetmap.org/way/605653721) | — | no |  |
| 55 | My Pets Oquiz | [n5497596792](https://www.openstreetmap.org/node/5497596792) | Avenida Manuel Antonio Matta 2460 | no |  |
| 56 | Perrísimos | [n4224328539](https://www.openstreetmap.org/node/4224328539) | Avenida Los Carrera 1385, Quilpué | no |  |
| 57 | Pet Exotic | [n11110888757](https://www.openstreetmap.org/node/11110888757) | — | no |  |
| 58 | Petclinic | [n10107372028](https://www.openstreetmap.org/node/10107372028) | — | no |  |
| 59 | QuillotaVet Clínica Veterinaria | [n4136198389](https://www.openstreetmap.org/node/4136198389) | Caletera Condell | sí |  |
| 60 | Rabivet | [w1157085477](https://www.openstreetmap.org/way/1157085477) | Avenida Ramón Freire 256, Quilpué | no |  |
| 61 | Royal Canín | [n4380957989](https://www.openstreetmap.org/node/4380957989) | Arlegui 1105 | no |  |
| 62 | Royal Pet | [w781465084](https://www.openstreetmap.org/way/781465084) | — | no |  |
| 63 | San Francisco | [n685989235](https://www.openstreetmap.org/node/685989235) | — | no |  |
| 64 | Sin Frontera | [n5349578158](https://www.openstreetmap.org/node/5349578158) | Tolson 84 | no |  |
| 65 | Suryavet | [n9015685888](https://www.openstreetmap.org/node/9015685888) | Avenida Valparaíso 1808, Villa Alemana | no |  |
| 66 | Taote Vet | [n4936017921](https://www.openstreetmap.org/node/4936017921) | Te Pito O Te Henua | sí | Rapa Nui |
| 67 | TerraVets - Tienda Peludos | [n12179267274](https://www.openstreetmap.org/node/12179267274) | Manuel Tocornal y Blanco Viel 201 | sí |  |
| 68 | Vet | [n3393341550](https://www.openstreetmap.org/node/3393341550) | — | no |  |
| 69 | Vet Bailly | [w916521274](https://www.openstreetmap.org/way/916521274) | — | no |  |
| 70 | Vet Covadonga | [n6323112987](https://www.openstreetmap.org/node/6323112987) | Covadonga, Quilpué | no |  |
| 71 | Vet Health | [n4225522924](https://www.openstreetmap.org/node/4225522924) | Avenida Blanco Encalada 1454, Quilpué | no |  |
| 72 | Vet Medical | [n6522189305](https://www.openstreetmap.org/node/6522189305) | — | no |  |
| 73 | Veterinaria Del Canelo | [n5187001323](https://www.openstreetmap.org/node/5187001323) | — | no |  |
| 74 | Veterinaria Dr Laing | [n4156525695](https://www.openstreetmap.org/node/4156525695) | Avenida República 303-A, Limache | no |  |
| 75 | Veterinaria Las Cruces | [n4668243648](https://www.openstreetmap.org/node/4668243648) | Avenida Las Salinas 204, Las Cruces | no |  |
| 76 | Veterinaria Olmué | [n12873420003](https://www.openstreetmap.org/node/12873420003) | Avenida Eastman 3473-B | sí |  |
| 77 | Veterinaria Tunquén | [n11500911895](https://www.openstreetmap.org/node/11500911895) | Algarrobo | no |  |
| 78 | Villa Pets | [n8023457416](https://www.openstreetmap.org/node/8023457416) | — | no |  |
| 79 | Zona Vet | [n12430759284](https://www.openstreetmap.org/node/12430759284) | — | no |  |
| 80 | (sin nombre) | [n2100773804](https://www.openstreetmap.org/node/2100773804) | — | no |  |
| 81 | (sin nombre) | [n3744184372](https://www.openstreetmap.org/node/3744184372) | — | no |  |
| 82 | (sin nombre) | [n6860763753](https://www.openstreetmap.org/node/6860763753) | — | no |  |
| 83 | (sin nombre) | [n9778386111](https://www.openstreetmap.org/node/9778386111) | — | no |  |
| 84 | (sin nombre) | [n10694186408](https://www.openstreetmap.org/node/10694186408) | — | no |  |
| 85 | (sin nombre) | [n10760263887](https://www.openstreetmap.org/node/10760263887) | Avenida Ramón Freire 1389, Quilpué | no |  |
| 86 | (sin nombre) | [n12357515943](https://www.openstreetmap.org/node/12357515943) | Isabel Brown 113, El Melón | no |  |
| 87 | (sin nombre) | [n13788174891](https://www.openstreetmap.org/node/13788174891) | — | no |  |
| 88 | (sin nombre) | [w660355002](https://www.openstreetmap.org/way/660355002) | — | no |  |

## Tiendas de mascotas (80)

Etiqueta: `shop=pet`. Se cargan como `pet_shop` (en la app, «Tiendas»).

| # | Nombre | OSM | Dirección | Teléfono | Nota |
|---|---|---|---|---|---|
| 1 | Ama Pet | [n9194755288](https://www.openstreetmap.org/node/9194755288) | Avenida Victoria, Peñablanca | no |  |
| 2 | Ami Mascotas | [n13787691043](https://www.openstreetmap.org/node/13787691043) | — | no |  |
| 3 | Anaken | [w1324256313](https://www.openstreetmap.org/way/1324256313) | Avenida Eastman 1841, Limache | sí |  |
| 4 | Anne & Alis Pet Shop | [n13311629598](https://www.openstreetmap.org/node/13311629598) | — | no |  |
| 5 | Arafer | [n4944317663](https://www.openstreetmap.org/node/4944317663) | Avenida Los Carrera 780, Quilpué | no |  |
| 6 | Avícola Lilian | [n12671022904](https://www.openstreetmap.org/node/12671022904) | Echaurren 1160, Limache | no |  |
| 7 | Avock Pet | [w662505461](https://www.openstreetmap.org/way/662505461) | Avenida Los Carrera 0654, Quilpué | no |  |
| 8 | Bahía Mascota | [n3744183108](https://www.openstreetmap.org/node/3744183108) | — | no |  |
| 9 | Bahía Mascota | [n6189021780](https://www.openstreetmap.org/node/6189021780) | Avenida Curauma Norte 2961, Curauma | no |  |
| 10 | Be Foods | [n2985986257](https://www.openstreetmap.org/node/2985986257) | Claudio Vicuña 811, Quilpué | no |  |
| 11 | Be Foods | [n4741651564](https://www.openstreetmap.org/node/4741651564) | Claudio Vicuña 687, Quilpué | no | repetido de n2985986257 |
| 12 | Be Foods | [n5839258392](https://www.openstreetmap.org/node/5839258392) | — | no |  |
| 13 | Be Foods | [n13175954901](https://www.openstreetmap.org/node/13175954901) | — | no |  |
| 14 | Befoods | [n4821572519](https://www.openstreetmap.org/node/4821572519) | Avenida Valparaíso 680 Local B y C, Villa Alemana | no |  |
| 15 | Befoods | [n9931297793](https://www.openstreetmap.org/node/9931297793) | — | no |  |
| 16 | BeFoods | [n9804252227](https://www.openstreetmap.org/node/9804252227) | Avenida Palmira Romano 1228, Limache | sí |  |
| 17 | Bodega Condell | [w1075624135](https://www.openstreetmap.org/way/1075624135) | Condell 41, Quillota | no |  |
| 18 | Bodega Olmué | [n11079946110](https://www.openstreetmap.org/node/11079946110) | — | no |  |
| 19 | Bosques de Lo Hidalgo | [n6397378585](https://www.openstreetmap.org/node/6397378585) | — | no |  |
| 20 | Can-Cats | [n13588242190](https://www.openstreetmap.org/node/13588242190) | Algarrobo | no |  |
| 21 | CatDog | [n12401894859](https://www.openstreetmap.org/node/12401894859) | Condell, Limache | no |  |
| 22 | Dog - Cat | [n12401918616](https://www.openstreetmap.org/node/12401918616) | Condell, Limache | no |  |
| 23 | Domy's Vet | [n9943094074](https://www.openstreetmap.org/node/9943094074) | — | no |  |
| 24 | Don Can | [n13767896365](https://www.openstreetmap.org/node/13767896365) | — | no |  |
| 25 | Donde Benito | [n14093118069](https://www.openstreetmap.org/node/14093118069) | — | no |  |
| 26 | Dsitribuidora "El Castillo de las Mascotas" | [n12461969892](https://www.openstreetmap.org/node/12461969892) | Baquedano, Limache | no |  |
| 27 | El Campo | [n5316795680](https://www.openstreetmap.org/node/5316795680) | Chacabuco | no |  |
| 28 | El Castillo de las Mascotas | [n11079946109](https://www.openstreetmap.org/node/11079946109) | — | no |  |
| 29 | Exotic Pets | [n9380276392](https://www.openstreetmap.org/node/9380276392) | — | no |  |
| 30 | Fauna Urbana | [n12401920666](https://www.openstreetmap.org/node/12401920666) | Condell, Limache | no |  |
| 31 | Food Power | [w1157085425](https://www.openstreetmap.org/way/1157085425) | Avenida Ramón Freire 1156, Quilpué | no |  |
| 32 | Frankarlos | [n5618218720](https://www.openstreetmap.org/node/5618218720) | — | no |  |
| 33 | Frankarlos | [n9015685914](https://www.openstreetmap.org/node/9015685914) | Avenida Valparaíso 1982, Villa Alemana | no |  |
| 34 | Fulerton | [n9288307136](https://www.openstreetmap.org/node/9288307136) | Angamos 240 | no |  |
| 35 | Fullerton Quillota | [n9901035058](https://www.openstreetmap.org/node/9901035058) | Condell 87, Quillota | no |  |
| 36 | Happy Patitas | [n11784700092](https://www.openstreetmap.org/node/11784700092) | — | no |  |
| 37 | Happy Pets | [n13034559970](https://www.openstreetmap.org/node/13034559970) | — | no |  |
| 38 | House Pet | [n4975458566](https://www.openstreetmap.org/node/4975458566) | — | no |  |
| 39 | Info Pet | [n12630396442](https://www.openstreetmap.org/node/12630396442) | Avenida Edmundo Eluchans 1737, Viña del Mar | no |  |
| 40 | J Pet's | [n10251695915](https://www.openstreetmap.org/node/10251695915) | — | no |  |
| 41 | Jack Boutique | [n12908369580](https://www.openstreetmap.org/node/12908369580) | — | no |  |
| 42 | JarFood | [n13544374974](https://www.openstreetmap.org/node/13544374974) | — | sí |  |
| 43 | León Cri | [n13782412086](https://www.openstreetmap.org/node/13782412086) | — | no |  |
| 44 | Lujos | [n5154350224](https://www.openstreetmap.org/node/5154350224) | Balmaceda 253, Quilpué | no |  |
| 45 | Marianela | [n2488541655](https://www.openstreetmap.org/node/2488541655) | Avenida República 1718, Limache | no |  |
| 46 | Masco Center | [n14101573058](https://www.openstreetmap.org/node/14101573058) | — | no |  |
| 47 | Mascofood | [n9797430411](https://www.openstreetmap.org/node/9797430411) | Avenida Blanca Estela 1927, Concón | no |  |
| 48 | Mascotas Quilpué | [n9170023819](https://www.openstreetmap.org/node/9170023819) | — | no |  |
| 49 | Mascotas Reñaca | [n12344403052](https://www.openstreetmap.org/node/12344403052) | Avenida Borgoño 14580, Viña del Mar | no |  |
| 50 | Mascotas Tucán | [n9864827115](https://www.openstreetmap.org/node/9864827115) | Condell 21, Quillota | no |  |
| 51 | Mascotas Villa Alemana | [n10229645712](https://www.openstreetmap.org/node/10229645712) | — | no |  |
| 52 | Maskotas | [n10155392442](https://www.openstreetmap.org/node/10155392442) | Condell 508 | sí |  |
| 53 | Master Puppy | [n10769541704](https://www.openstreetmap.org/node/10769541704) | Claudio Vicuña 799, Quilpué | no |  |
| 54 | Mi Mascotas | [n5565483820](https://www.openstreetmap.org/node/5565483820) | — | no |  |
| 55 | Mi Niña | [n11496011180](https://www.openstreetmap.org/node/11496011180) | — | no |  |
| 56 | Mundo Acuático | [n4049512072](https://www.openstreetmap.org/node/4049512072) | Vicuña Mackenna 687, Quilpué | no |  |
| 57 | Origen Animal | [n9994161262](https://www.openstreetmap.org/node/9994161262) | Avenida Eastman, Limache | no |  |
| 58 | Paraíso Animal | [n12319598151](https://www.openstreetmap.org/node/12319598151) | Avenida José Tomás Urmeneta 612 | sí |  |
| 59 | Paraíso Animal | [n13450441443](https://www.openstreetmap.org/node/13450441443) | — | no |  |
| 60 | Patita's | [n9563382987](https://www.openstreetmap.org/node/9563382987) | Figueroa Larraín 0789, Quilpué | no |  |
| 61 | Patitas Compinches | [n14013692160](https://www.openstreetmap.org/node/14013692160) | Avenida Obispo Valdés Subercaseaux 1285, Curauma | no |  |
| 62 | Perrito | [n2975039327](https://www.openstreetmap.org/node/2975039327) | Avenida Los Carrera 01628, Quilpué | no |  |
| 63 | Pupipet | [n12344403051](https://www.openstreetmap.org/node/12344403051) | Avenida Borgoño 14580, Viña del Mar | no |  |
| 64 | Puppy's Nutrition | [n10079106192](https://www.openstreetmap.org/node/10079106192) | Avenida Palmira Romano 405, Limache | no |  |
| 65 | Renata | [n13418318431](https://www.openstreetmap.org/node/13418318431) | Andrés Bello 406 | no |  |
| 66 | Santa Fe | [n10555447553](https://www.openstreetmap.org/node/10555447553) | Avenida República 1985, Limache | sí |  |
| 67 | Squishy Pet | [n10809406149](https://www.openstreetmap.org/node/10809406149) | — | no |  |
| 68 | Squishy Pet | [n12015938523](https://www.openstreetmap.org/node/12015938523) | — | no |  |
| 69 | Superzoo | [n5512737600](https://www.openstreetmap.org/node/5512737600) | — | no |  |
| 70 | SuperZoo | [n12160933170](https://www.openstreetmap.org/node/12160933170) | Avenida Los Carrera 754, Quilpué | no |  |
| 71 | SuperZoo | [n12837562640](https://www.openstreetmap.org/node/12837562640) | Avenida Curauma Norte 2961, Curauma | no |  |
| 72 | SuperZoo | [w669031628](https://www.openstreetmap.org/way/669031628) | Avenida Libertad 395, Viña del Mar | no |  |
| 73 | Suricatas Pet | [n3940754093](https://www.openstreetmap.org/node/3940754093) | — | no |  |
| 74 | TwinsMania | [n13733380441](https://www.openstreetmap.org/node/13733380441) | 7 Norte 469, Viña del Mar | no |  |
| 75 | Vida Animal | [n11059724696](https://www.openstreetmap.org/node/11059724696) | — | no |  |
| 76 | Villa Quiltro | [n10759213166](https://www.openstreetmap.org/node/10759213166) | Avenida Valparaíso 2650, Villa Alemana | no |  |
| 77 | (sin nombre) | [n5275944872](https://www.openstreetmap.org/node/5275944872) | — | no |  |
| 78 | (sin nombre) | [n9083217343](https://www.openstreetmap.org/node/9083217343) | — | no |  |
| 79 | (sin nombre) | [n9576668880](https://www.openstreetmap.org/node/9576668880) | Presbítero Eduardo Lecourt 12, Villa Alemana | no |  |
| 80 | (sin nombre) | [w606526969](https://www.openstreetmap.org/way/606526969) | — | no |  |

## Peluquerías (13)

Etiqueta: `shop=pet_grooming` y `shop=hairdresser` con nombre de peluquería canina. Se cargan como `peluqueria`.

| # | Nombre | OSM | Dirección | Teléfono | Nota |
|---|---|---|---|---|---|
| 1 | Camada Pet Shop | [n10710058490](https://www.openstreetmap.org/node/10710058490) | Las Pelargonias 842 | no |  |
| 2 | Kewan Pet Supply Store | [n10726771347](https://www.openstreetmap.org/node/10726771347) | Avenida José Manuel Balmaceda 199 | no |  |
| 3 | Maskosita | [n13788189133](https://www.openstreetmap.org/node/13788189133) | Narciso Aguirre, El Quisco | no |  |
| 4 | Oassis Canino | [n12601623538](https://www.openstreetmap.org/node/12601623538) | Unión 2324 | sí |  |
| 5 | Peluquería Canina | [w422971406](https://www.openstreetmap.org/way/422971406) | Avenida Blanco Encalada 1320, Quilpué | no |  |
| 6 | Peluquería Canina Isapel | [n9319894042](https://www.openstreetmap.org/node/9319894042) | — | no |  |
| 7 | Peluquería Canina Peluditos II | [n6758044768](https://www.openstreetmap.org/node/6758044768) | Avenida Valparaíso 1293, Villa Alemana | no |  |
| 8 | Peluquería Canina Quiltritos | [n9823962559](https://www.openstreetmap.org/node/9823962559) | Andrés Bello, Limache | sí |  |
| 9 | Peluquería Canina Urbanpet La Cruz | [n11347296365](https://www.openstreetmap.org/node/11347296365) | Ricardo Cordova 150, La Cruz | sí |  |
| 10 | Pumi Patitas | [n13782494607](https://www.openstreetmap.org/node/13782494607) | — | no |  |
| 11 | Simón y sus Amigos | [n13782523505](https://www.openstreetmap.org/node/13782523505) | — | no |  |
| 12 | SuperZoo | [n11386458079](https://www.openstreetmap.org/node/11386458079) | Avenida Concón Reñaca 3400, Concón | no |  |
| 13 | Traviezoos Pet Shop | [n10056185446](https://www.openstreetmap.org/node/10056185446) | — | no |  |

## Laboratorios veterinarios (0)

Etiqueta: `healthcare=laboratory` con señal veterinaria. No hay ninguno en OpenStreetMap. La categoría `laboratorio` queda vacía hasta cargar lugares verificados.

## Farmacias veterinarias (4)

Etiqueta: `amenity=pharmacy` con «veterin» en el nombre, o `amenity=veterinary_pharmacy`. No se cargan: la categoría se descartó.

| # | Nombre | OSM | Dirección | Teléfono | Nota |
|---|---|---|---|---|---|
| 1 | Farmacia Veterinaria Farmavet | [n4197966684](https://www.openstreetmap.org/node/4197966684) | Irarrázabal 634, Quilpué | no |  |
| 2 | Farmacia Veterinaria Farmavet | [n4741651625](https://www.openstreetmap.org/node/4741651625) | — | no |  |
| 3 | San Nicolás | [n13782519278](https://www.openstreetmap.org/node/13782519278) | — | no |  |
| 4 | Tribu Mascotas | [n13418318432](https://www.openstreetmap.org/node/13418318432) | Andrés Bello 406 | sí |  |

