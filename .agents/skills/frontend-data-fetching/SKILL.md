---
name: frontend-data-fetching
description: Explains the standard for loading and consuming information in the frontend using relationship endpoints to avoid fat endpoints.
---

# Frontend Data Fetching Skill

This skill defines how to architect data consumption in the frontend. The core principle is **Granularity over Monoliths**.

## The Pattern: Relational Loading

Instead of requesting a "House" with all its "Rooms" in a single API call, we split the concerns. This allows for better caching, smaller payloads, and easier state management.

### Example: House and Rooms

#### 1. Load the Main Entity
When entering a detail view, fetch only the primary data.
```tsx
// frontend/app/(dashboard)/houses/[id]/page.tsx
const { data: house } = useHousesControllerFindOne(houseId);
```

#### 2. Load Related Data via Relationship Hooks
Use the specific hook for that relationship. These hooks are typically found in `frontend/src/api/generated/[domain]/[source]-[targets]`.
```tsx
// frontend/components/houses/room-list.tsx
const { data: rooms, isLoading } = useHouseRoomsControllerFindRoomsByHouseId(houseId);
```

#### 3. Perform Relationship Actions
To add a room to a house, use the association endpoint instead of updating the whole house object.
```tsx
const addRoom = useHouseRoomsControllerAddRoomToHouse();

const handleAdd = (roomId: number) => {
  addRoom.mutate({ houseId, roomId });
};
```

## Why this approach?
- **Cache Efficiency**: Updating a 'Room' only invalidates the 'Rooms' cache for that 'House', not the 'House' data itself.
- **Payload Size**: Avoid transferring large nested JSON structures.
- **Reusability**: Relationship endpoints are standardized and generated automatically by the backend scripts.
- **Consistency**: Follows the `generate-relationship-module` pattern used in the backend.

## Integration with DataTable
When showing related items in a table, always point the `DataTable` to the relationship endpoint.
```tsx
<DataTable 
  hook={useHouseRoomsControllerFindRoomsByHouseId} 
  params={{ houseId }} 
  // ...
/>
```

## Related Skills
- [generate-relationship-module](file:///c:/Users/Usuario/Documents/Repositorios/trucking_app/.agents/skills/generate-relationship-module/SKILL.md)
- [use-data-table](file:///c:/Users/Usuario/Documents/Repositorios/trucking_app/.agents/skills/use-data-table/SKILL.md)
