import { Spot } from './spot.interface';

export interface SpotsData {
  free_spots: number;
  spots: Spot[];
  total_spots: number;
}
