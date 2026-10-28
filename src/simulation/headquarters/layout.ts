import type {
  DepartmentDefinition,
  DepartmentId,
  HeadquartersLayout,
  StationDefinition,
  StationId
} from '../../game/models';

export function getStation(layout: HeadquartersLayout, id: StationId): StationDefinition {
  const station = layout.stations.find(item => item.id === id);
  if (!station) throw new Error(`Unknown station: ${id}`);
  return station;
}

export function getDepartment(
  layout: HeadquartersLayout,
  id: DepartmentId
): DepartmentDefinition {
  const department = layout.departments.find(item => item.id === id);
  if (!department) throw new Error(`Unknown department: ${id}`);
  return department;
}

export function getStationsInDepartment(
  layout: HeadquartersLayout,
  id: DepartmentId
): StationDefinition[] {
  return layout.stations.filter(station => station.departmentId === id);
}
