package com.example.movierecord.service;

import com.example.movierecord.entity.Movie;
import com.example.movierecord.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public Page<Movie> searchMovies(String keyword, String type, Integer year, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return movieRepository.searchMovies(
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                type,
                year,
                pageable);
    }

    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }

    public List<Integer> getAllYears() {
        return movieRepository.findAllYears();
    }

    @Transactional
    public Movie saveMovie(Movie movie) {
        if (movie.getId() == null) {
            Optional<Movie> existing = movieRepository.findByTitleAndYearAndType(
                    movie.getTitle(), movie.getYear(), movie.getType());
            if (existing.isPresent()) {
                return existing.get();
            }
            if (movie.getDoubanId() != null) {
                existing = movieRepository.findByDoubanId(movie.getDoubanId());
                if (existing.isPresent()) {
                    return existing.get();
                }
            }
            if (movie.getImdbId() != null) {
                existing = movieRepository.findByImdbId(movie.getImdbId());
                if (existing.isPresent()) {
                    return existing.get();
                }
            }
        }
        return movieRepository.save(movie);
    }

    @Transactional
    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }
}
