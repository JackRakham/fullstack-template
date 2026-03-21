# Carga Granular de Datos en Frontend

Para asegurar la escalabilidad, el rendimiento y la modularidad de la aplicación, todos los agentes **DEBEN** seguir este estándar al implementar vistas o funcionalidades en el frontend.

## Regla de Oro
**NUNCA** utilices o crees "fat endpoints" (endpoints que devuelven múltiples entidades relacionadas en una sola respuesta, ej: `include: ['rooms', 'owner', 'address']`).

## Instrucciones para Agentes:
1.  **Carga Secuencial/Bajo Demanda**: Carga primero la entidad principal por su ID.
2.  **Uso de Relaciones**: Utiliza los hooks de relación generados (ej: `useRolePermissionsControllerFindPermissionsByRoleId`) para cargar datos secundarios.
3.  **Acciones Granulares**: Cualquier modificación de relaciones (añadir, quitar, reemplazar) debe hacerse a través de los endpoints de relación específicos, no enviando todo el objeto anidado al endpoint de la entidad principal.
4.  **Modularidad**: Mantén los componentes de UI enfocados en su entidad. El componente que gestiona 'Habitaciones' debe consumir su propio endpoint de relación vinculado al ID de la 'Casa'.

## Excepciones
Solo se permiten "fat endpoints" o `include` en casos de extrema necesidad de rendimiento donde la latencia de múltiples peticiones sea crítica y esté debidamente justificado, o en búsquedas complejas donde el filtrado dependa de la relación.
