import type { DevelopmentContext, PartId } from '../../game/development';
import type { DevelopmentWorld, UpgradeSubmission } from './types';

export type EventDocumentEntry = {
  partId: PartId;
  partName: string;
  submission: UpgradeSubmission | null;
};

export type EventDocument = {
  eventId: string;
  eventName: string;
  teams: Array<{ teamId: string; teamName: string; entries: EventDocumentEntry[] }>;
};

/**
 * The FIA-style car presentation document for one Grand Prix: every team,
 * every part, with its submission or "no submission".
 */
export function buildEventDocument(
  world: DevelopmentWorld,
  context: DevelopmentContext,
  season: number,
  eventId: string
): EventDocument {
  const event = context.calendar.find(item => item.id === eventId);
  if (!event) throw new Error(`Unknown event: ${eventId}`);
  const forEvent = world.submissions.filter(
    submission => submission.season === season && submission.eventId === eventId
  );
  return {
    eventId,
    eventName: event.name,
    teams: context.teams.map(team => ({
      teamId: team.id,
      teamName: team.name,
      entries: context.parts.map(part => ({
        partId: part.id,
        partName: part.name,
        submission:
          forEvent.find(item => item.teamId === team.id && item.partId === part.id) ?? null
      }))
    }))
  };
}
