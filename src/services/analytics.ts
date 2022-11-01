import { init, track } from '@amplitude/analytics-browser';

export const analyticsInit = () => {
  init('ad06b078fe1dee24d5219e5caf08dc16');
};

export type Events = {
};

export const analyticsTrack = <T extends keyof Events>(name: T, properties: Events[T]) => {
  track(name, properties);
}
