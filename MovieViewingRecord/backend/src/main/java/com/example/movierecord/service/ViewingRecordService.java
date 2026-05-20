package com.example.movierecord.service;

import com.example.movierecord.entity.Movie;
import com.example.movierecord.entity.ViewingRecord;
import com.example.movierecord.repository.MovieRepository;
import com.example.movierecord.repository.ViewingRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ViewingRecordService {

    @Autowired
    private ViewingRecordRepository viewingRecordRepository;

    @Autowired
    private MovieRepository movieRepository;

    public Page<ViewingRecord> getUserRecords(Long userId, String status, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ViewingRecord> records = viewingRecordRepository.findByUserIdWithFilters(
                userId,
                (status != null && !status.trim().isEmpty()) ? status.trim() : null,
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                pageable);

        records.forEach(record -> {
            movieRepository.findById(record.getMovieId()).ifPresent(record::setMovie);
        });

        return records;
    }

    public Optional<ViewingRecord> getRecordById(Long id) {
        Optional<ViewingRecord> recordOpt = viewingRecordRepository.findById(id);
        recordOpt.ifPresent(record -> {
            movieRepository.findById(record.getMovieId()).ifPresent(record::setMovie);
        });
        return recordOpt;
    }

    public Optional<ViewingRecord> getRecordByUserAndMovie(Long userId, Long movieId) {
        Optional<ViewingRecord> recordOpt = viewingRecordRepository.findByUserIdAndMovieId(userId, movieId);
        recordOpt.ifPresent(record -> {
            movieRepository.findById(record.getMovieId()).ifPresent(record::setMovie);
        });
        return recordOpt;
    }

    public List<Integer> getWatchYears(Long userId) {
        return viewingRecordRepository.findWatchYearsByUserId(userId);
    }

    @Transactional
    public ViewingRecord saveRecord(ViewingRecord record) {
        if (record.getId() == null) {
            Optional<ViewingRecord> existing = viewingRecordRepository.findByUserIdAndMovieId(
                    record.getUserId(), record.getMovieId());
            if (existing.isPresent()) {
                ViewingRecord existingRecord = existing.get();
                existingRecord.setStatus(record.getStatus());
                existingRecord.setRating(record.getRating());
                existingRecord.setReview(record.getReview());
                existingRecord.setWatchDate(record.getWatchDate());
                return viewingRecordRepository.save(existingRecord);
            }
        }
        return viewingRecordRepository.save(record);
    }

    @Transactional
    public void deleteRecord(Long id) {
        viewingRecordRepository.deleteById(id);
    }
}
