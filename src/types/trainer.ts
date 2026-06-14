/** Client-side trainer discovery models. */

export type ConnectionStatus = 'none' | 'pending' | 'connected';

export interface Trainer {
  id: string;
  name: string;
  avatar?: string;
  /** Short professional headline, e.g. "Strength & Conditioning Coach". */
  headline: string;
  bio: string;
  /** Training types / focus areas — also used for filtering. */
  specialties: string[];
  location: string;
  /** Average rating 0–5. */
  rating: number;
  reviews: number;
  pricePerSession: string;
  experienceYears: number;
  certifications: string[];
  /** Offers online sessions. */
  online: boolean;
  connection: ConnectionStatus;
}
