import React, { useContext, useRef, useEffect } from "react";
import { SearchContext } from "../store/search-context";
import MovieListItem from "../components/MovieListItem";
import styles from "./MovieList.module.scss";
import { useIsInViewport } from "../hooks/hooks";
import { MovieContext } from "../store/movie-context";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";

import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
const MovieList: React.FC = (props) => {
  const movieCtx = useContext(MovieContext);
  const searchCtx = useContext(SearchContext);

  const infinityScrollTrigger = useRef(null);
  const isInfScrInViewport = useIsInViewport(infinityScrollTrigger);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isInfScrInViewport) return;
    if (!!!searchCtx.production) navigate("/");
    if (!movieCtx.isAllLoaded) movieCtx.fetchMoreMovies();
  }, [
    isInfScrInViewport,
    searchCtx.production,
    searchCtx.type,
    searchCtx.year,
  ]);
  return (
    <React.Fragment>
      <div className={styles["text-box"]}>
        <div className={styles["back-button"]} onClick={() => navigate("/")}>
          <ArrowCircleLeftIcon fontSize="inherit" />
        </div>
        <p>
          Showing results for: {'"' + searchCtx.production + '"'}
          {searchCtx.type !== "any" && " | type: " + searchCtx.type}
          {searchCtx.year !== "" && " | year: " + searchCtx.year}
        </p>
      </div>
      <div className={styles["movie-list"]}>
        {movieCtx.fetchedMovies.map((item) => (
          <MovieListItem movie={item} />
        ))}
      </div>
      <div ref={infinityScrollTrigger} className={styles["text-box"]}>
        {movieCtx.isLoading ? <CircularProgress color="inherit" /> : ""}
        <b>
          {movieCtx.isAllLoaded &&
            movieCtx.fetchedMovies.length === 0 &&
            "Found no productions matching your criteria"}
          {movieCtx.isAllLoaded &&
            movieCtx.fetchedMovies.length !== 0 &&
            "That's all we have"}
        </b>
      </div>
    </React.Fragment>
  );
};

export default MovieList;
