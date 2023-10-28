import { ObjectId } from 'mongodb';

export interface CastCrew {
  _id: ObjectId;
  Title: string;
  Title_URL: string;
  Image: string;
  Birthday: string;
  Type?: string;
}
