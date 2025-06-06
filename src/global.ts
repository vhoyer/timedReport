export type Task = {
  /** id of the card */
  id: string;
  /** title of the task */
  title: string;
  /** a major project for in which this task belongs */
  project: string;
  /** description of the task */
  description: string;
  /** time spent on task */
  time: number;
  /** estimated time of completion */
  eta: number;
  /** index of the main taskState array */
  taskState: number;
  /** task percentage completion */
  percentage: number;
  /** date of creation */
  createdAt: string;
  /** is the card selected */
  isSelected: boolean;
  /** is the card hidden */
  isHidden: boolean;
  /** billable rate for the task (0 means not billable) */
  billable: number;
};
