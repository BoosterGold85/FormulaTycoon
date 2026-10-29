export * from './date';
export * from './calendarPolicyV4';
import {parseCampaignDate,compareCampaignDates,type CampaignDate} from './date';
import {campaignContext} from './calendarPolicyV4';

export function nextCampaignDate(current:CampaignDate,target:CampaignDate):CampaignDate {
 parseCampaignDate(target);campaignContext(target);
 if(compareCampaignDates(target,current)<0)throw new Error('Backward campaign advancement is not allowed');return target;
}
