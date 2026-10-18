# Fuentes cartográficas de PLANdeC

## Capas territoriales

Fuente: Marco Geoestadístico Nacional 2025 del DANE, capa Municipio (servicio 317).

- Atlántico: 23 municipios, mapa operativo ya publicado.
- Norte de Santander: 40 municipios, capa descargada y validada.
- Bogotá D. C.: límite distrital descargado y validado. Las localidades se incorporarán desde una capa oficial distrital.
- Cundinamarca: 116 municipios, capa descargada y validada.

Los archivos se almacenan en `public/data` como GeoJSON optimizado para la web. Los códigos DANE se conservarán para relacionar los mapas con resultados, puestos y mesas.

## Puestos de votación

Los límites geográficos no incluyen puestos de votación. Estos se cargarán por separado desde la DIVIPOL de la Registraduría y se geocodificarán con dirección y coordenadas verificables.

## Regla de publicación

Un territorio puede mostrarse como mapa base cuando su geometría esté validada. Solo se marcará como electoralmente activo cuando también tenga catálogo de puestos, coordenadas y resultados históricos relacionados.
