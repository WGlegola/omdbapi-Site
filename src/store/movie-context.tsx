import React, { useState, useContext, useEffect } from "react";
import MovieItem from "../models/movie-item";
import { SearchContext } from "./search-context";

type SearchResponse = {
  Search: {
    Poster: string;
    Title: string;
    Type: string;
    Year: number;
    imdbID: string;
  }[];
  totalResults: number;
  Response: string;
};

export const MovieContext = React.createContext<{
  fetchedMovies: MovieItem[];
  isLoading: boolean;
  isAllLoaded: boolean;
  fetchMoreMovies: () => void;
}>({
  fetchedMovies: [],
  isLoading: false,
  isAllLoaded: false,
  fetchMoreMovies: () => {},
});

const MovieContextProvider: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const searchCtx = useContext(SearchContext);

  const [fetchedMovies, setFetchedMovies] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAllLoaded, setIsAllLoaded] = useState<boolean>(false);
  const [lastFetchedMoviesPage, setLastFetchedMoviesPage] = useState<number>(1);
  const [noResults, setNoResults] = useState<number>(0);

  useEffect(() => {
    setFetchedMovies([]);
    setIsLoading(false);
    setIsAllLoaded(false);
    setLastFetchedMoviesPage(1);
  }, [searchCtx.production, searchCtx.type, searchCtx.year]);

  const fetchMoreMoviesHandler = () => {
    if (isAllLoaded) return;
    setIsLoading(true);
    console.log(`https://www.omdbapi.com/?apikey=64e502b&s=${
      searchCtx.production
    }${searchCtx.type !== "any" ? "&type=" + searchCtx.type : ""}${
      !!searchCtx.year ? "&y=" + searchCtx.year : ""
    }${"&page=" + lastFetchedMoviesPage}
    `);
    fetch(
      `https://www.omdbapi.com/?apikey=64e502b&s=${searchCtx.production}${
        searchCtx.type !== "any" ? "&type=" + searchCtx.type : ""
      }${!!searchCtx.year ? "&y=" + searchCtx.year : ""}${
        "&page=" + lastFetchedMoviesPage
      }
      `
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        return response.json();
      })
      .then((data: SearchResponse) => {
        console.log(data);
        if (data.Response === "False") {
          setIsAllLoaded(true);
          setIsLoading(false);
          setFetchedMovies([]);
          return;
        }
        if (lastFetchedMoviesPage === 1) {
          setNoResults(data.totalResults);
        }

        if (lastFetchedMoviesPage !== 100) {
          setLastFetchedMoviesPage(lastFetchedMoviesPage + 1);
        } else {
          setIsAllLoaded(true);
        }
        const newMovies = data.Search.map<MovieItem>((movie) => ({
          title: movie.Title,
          posterUrl: movie.Poster,
          year: movie.Year,
          id: movie.imdbID,
          type: movie.Type,
        }));
        setFetchedMovies([...fetchedMovies, ...newMovies]);

        if (noResults === fetchedMovies.length) {
          setIsAllLoaded(true);
        }
        setIsLoading(false);
      });
  };

  return (
    <MovieContext.Provider
      value={{
        fetchedMovies: fetchedMovies,
        isLoading: isLoading,
        isAllLoaded: isAllLoaded,
        fetchMoreMovies: fetchMoreMoviesHandler,
      }}
    >
      {props.children}
    </MovieContext.Provider>
  );
};
export default MovieContextProvider;