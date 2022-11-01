import type { Task } from '../global';
import { init, track } from '@amplitude/analytics-browser';

export const analyticsInit = () => {
  init('ad06b078fe1dee24d5219e5caf08dc16');
};

type AnalyticsTrack = {
  (name: 'contextmenu', properties: {
    event: 'select';
    name: string;
    type: 'builtin'|'custom'|'state';
  }): void;
  (name: 'task_create', properties: {
    count: number;
  }): void;
  (name: 'task_delete'): void;
  (name: 'task_edit', properties: {
    name: keyof Task;
  }): void;
  (name: 'custom_config', properties: {
    event: 'run'|'load'|'download';
  }): void;
  (name: 'navbar', properties: {
    name: string;
  }): void;
};

export const analyticsTrack: AnalyticsTrack = (name: string, properties?: any) => {
  track(name, properties);
}
