/** Trainer-side client model. */

export interface Client {
  id: string;
  name: string;
  avatar?: string;
  lastSession?: string;
  tag: string;
}
