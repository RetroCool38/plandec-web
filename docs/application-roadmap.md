# PLANdeC — ruta de implementación

## Piloto: Atlántico / Barranquilla

1. Crear proyecto Supabase y activar PostGIS.
2. Ejecutar `database-plan.sql` y probar las políticas RLS.
3. Importar departamentos, municipios, puestos, mesas y resultados históricos.
4. Crear usuarios de prueba: administrador, coordinador y líder.
5. Conectar el formulario beta a Supabase Auth y PostgreSQL.
6. Construir agregados por puesto y mesa para el mapa de fortaleza.
7. Validar el piloto con datos ficticios antes de cargar información real.

## Zonas de trabajo confirmadas

1. Atlántico: piloto activo, comenzando por Barranquilla.
2. Norte de Santander: segunda carga territorial.
3. Bogotá–Cundinamarca: zona operativa conjunta con Bogotá D.C. y Cundinamarca almacenadas como entidades separadas.

## Expansión territorial

Cada nuevo departamento requiere: límites geográficos, catálogo DIVIPOL, coordenadas de puestos, mesas y resultados por elección. La interfaz ya seguirá el orden Departamento → Municipio → Puesto → Mesa.

La cobertura no quedará limitada a las zonas iniciales. Cada campaña podrá activar nuevos departamentos y municipios sin modificar el modelo general, manteniendo separados sus usuarios, líderes, contactos, permisos e indicadores.

## Criterios de análisis

- Histórico electoral: datos oficiales por elección.
- Registros de campaña: únicamente información voluntaria y autorizada.
- Antecedente político: categoría opcional autodeclarada, nunca voto comprobado.
- Fortaleza territorial: totales agregados por puesto o mesa, sin exponer perfiles individuales.
