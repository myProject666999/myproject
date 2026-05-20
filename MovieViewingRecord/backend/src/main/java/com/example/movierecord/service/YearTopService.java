package com.example.movierecord.service;

import com.example.movierecord.entity.YearTop;
import com.example.movierecord.repository.MovieRepository;
import com.example.movierecord.repository.YearTopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class YearTopService {

    @Autowired
    private YearTopRepository yearTopRepository;

    @Autowired
    private MovieRepository movieRepository;

    public List<YearTop> getYearTop(Long userId, Integer year) {
        List<YearTop> topList = yearTopRepository.findByUserIdAndYearOrderByRankAsc(userId, year);
        topList.forEach(top -> {
            movieRepository.findById(top.getMovieId()).ifPresent(top::setMovie);
        });
        return topList;
    }

    public List<Integer> getTopYears(Long userId) {
        return yearTopRepository.findYearsByUserId(userId);
    }

    @Transactional
    public YearTop saveYearTop(YearTop yearTop) {
        if (yearTop.getRank() < 1 || yearTop.getRank() > 10) {
            throw new IllegalArgumentException("排名必须在1-10之间");
        }

        Optional<YearTop> existingByRank = yearTopRepository.findByUserIdAndYearAndRank(
                yearTop.getUserId(), yearTop.getYear(), yearTop.getRank());
        existingByRank.ifPresent(yearTopRepository::delete);

        Optional<YearTop> existingByMovie = yearTopRepository.findByUserIdAndYearAndMovieId(
                yearTop.getUserId(), yearTop.getYear(), yearTop.getMovieId());
        existingByMovie.ifPresent(yearTopRepository::delete);

        return yearTopRepository.save(yearTop);
    }

    @Transactional
    public void deleteYearTop(Long id) {
        yearTopRepository.deleteById(id);
    }

    @Transactional
    public void clearYearTop(Long userId, Integer year) {
        yearTopRepository.deleteByUserIdAndYear(userId, year);
    }
}
