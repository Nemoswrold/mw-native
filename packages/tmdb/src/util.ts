import { TMDB } from "tmdb-ts";

const TMDB_API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YzJkZmNkYzNhYWQzYTVhYzA0YjMwMWQxZDY4YWY5MiIsInN1YiI6IjY1ZDhjZmEyNDBkMGZlMDE4NWExYTNiOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NVQ8hEZvypGg5_lmCJr_5lNKYCusLJ-bgXwErlFJ9wM";
export const tmdb = new TMDB(TMDB_API_KEY);

export function getMediaPoster(posterPath: string): string {
  return `https://image.tmdb.org/t/p/w500/${posterPath}`;
}
