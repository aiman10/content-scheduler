import { ObjectId } from 'mongodb';

export interface Award {
  _id: ObjectId;
  name: string;
  date: string;
  imdb: string;
  url: string;
}
