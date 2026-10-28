import React from 'react';
import type { HeadquartersLayout } from '../../game/models';
import {
  getDepartment,
  getStation,
  getWorker,
  summarizeDepartment,
  type HeadquartersState,
  type WorkerState
} from '../../simulation/headquarters';
import type { Selection } from '../scene/HeadquartersScene';
import { theme } from '../theme';
import { InfoCard } from './InfoCard';

const STATE_LABEL: Record<WorkerState, { text: string; color: string }> = {
  IDLE: { text: 'IDLE', color: '#A9B6C6' },
  WALKING: { text: 'WALKING', color: theme.warning },
  WORKING: { text: 'WORKING', color: theme.success }
};

/** Read-only preview of the selected worker or department. */
export function SelectionCard({
  selection,
  state,
  layout
}: {
  selection: NonNullable<Selection>;
  state: HeadquartersState;
  layout: HeadquartersLayout;
}) {
  if (selection.kind === 'worker') {
    const worker = getWorker(state, selection.id);
    if (!worker) return null;
    const station = worker.assignment ? getStation(layout, worker.assignment.stationId) : null;
    const department = station ? getDepartment(layout, station.departmentId) : null;
    const status = STATE_LABEL[worker.state];
    return (
      <InfoCard
        title={worker.name}
        subtitle={worker.role}
        rows={[
          { label: 'STATUS', value: status.text, color: status.color },
          { label: 'DEPARTMENT', value: department?.name ?? 'Unassigned' },
          { label: 'STATION', value: station?.name ?? '—' }
        ]}
      />
    );
  }

  const department = getDepartment(layout, selection.id);
  const summary = summarizeDepartment(state, layout, selection.id);
  const statusColor =
    summary.status === 'Active' ? theme.success : summary.status === 'Unstaffed' ? '#A9B6C6' : theme.warning;
  return (
    <InfoCard
      title={department.name}
      subtitle="Department"
      rows={[
        { label: 'STAFF', value: String(summary.staffCount) },
        { label: 'STATUS', value: summary.status, color: statusColor },
        ...summary.stations.map(station => ({
          label: station.name.toUpperCase(),
          value: `${station.assigned} / ${station.capacity}`
        }))
      ]}
      footnote="Department management is coming in a future update."
    />
  );
}
