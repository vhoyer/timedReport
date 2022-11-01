import { init, track } from '@amplitude/analytics-browser';

export const analyticsInit = () => {
  init('ad06b078fe1dee24d5219e5caf08dc16');
};

export type Events = {
  'contextmenu_select': {
    name: string;
    type: 'builtin'|'custom'|'state';
  };
};

export const analyticsTrack = <T extends keyof Events>(
  name: T,
  properties: Events[T],
) => {
  track(name, properties);
}