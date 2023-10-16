export interface Root {
  id: number;
  results: IResult[];
}

export interface IResult {
  iso_3166_1: string;
  release_dates: ReleaseDate[];
}

export interface ReleaseDate {
  certification: string;
  descriptors: string[];
  iso_639_1: string;
  note: string;
  release_date: string;
  type: number;
}
