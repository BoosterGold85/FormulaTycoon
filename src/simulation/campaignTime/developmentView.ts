import type {DevelopmentWorld,DevelopmentState} from '../development/types';
import {campaignContext,type CampaignDate} from './index';
/** Read-only temporal projection consumed by the existing balanced kernel; never persisted. */
export function developmentView(state:DevelopmentState,date:CampaignDate):DevelopmentWorld {
 const {seasonIndex,week}=campaignContext(date);return {...state,season:seasonIndex,week};
}
export function developmentState(view:DevelopmentWorld):DevelopmentState {
 const {season:_season,week:_week,...state}=view;return state;
}
