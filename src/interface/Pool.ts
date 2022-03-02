export interface Pool {
  name: string;
  type: string;
  objectID: string;
  isGrouped: boolean;
  groupID?: string;
  uiID?: string;
  interactWithHand: string;       // right, left or empty string
  latchToController: string;      // right, left or empty string
  priority: number;               // zero being the highest possible priority
}
