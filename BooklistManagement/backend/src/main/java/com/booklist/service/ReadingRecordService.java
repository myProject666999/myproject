package com.booklist.service;

import com.booklist.dto.ReadingRecordDTO;
import com.booklist.entity.BookList;
import com.booklist.entity.ReadingRecord;
import com.booklist.repository.BookListRepository;
import com.booklist.repository.ReadingRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReadingRecordService {

    private final ReadingRecordRepository readingRecordRepository;
    private final BookListRepository bookListRepository;

    public List<ReadingRecordDTO> findByBookListId(Long bookListId) {
        return readingRecordRepository.findByBookListIdOrderByReadDateDesc(bookListId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<ReadingRecordDTO> findById(Long id) {
        return readingRecordRepository.findById(id).map(this::convertToDTO);
    }

    @Transactional
    public ReadingRecordDTO create(ReadingRecordDTO dto) {
        BookList bookList = bookListRepository.findById(dto.getBookListId())
                .orElseThrow(() -> new IllegalArgumentException("BookList not found with id: " + dto.getBookListId()));

        ReadingRecord record = new ReadingRecord();
        record.setBookList(bookList);
        record.setReadDate(dto.getReadDate());
        record.setDurationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 0);
        record.setPagesRead(dto.getPagesRead());
        record.setNote(dto.getNote());

        record = readingRecordRepository.save(record);
        return convertToDTO(record);
    }

    @Transactional
    public Optional<ReadingRecordDTO> update(Long id, ReadingRecordDTO dto) {
        return readingRecordRepository.findById(id).map(record -> {
            if (dto.getReadDate() != null) {
                record.setReadDate(dto.getReadDate());
            }
            if (dto.getDurationMinutes() != null) {
                record.setDurationMinutes(dto.getDurationMinutes());
            }
            if (dto.getPagesRead() != null) {
                record.setPagesRead(dto.getPagesRead());
            }
            if (dto.getNote() != null) {
                record.setNote(dto.getNote());
            }
            return convertToDTO(readingRecordRepository.save(record));
        });
    }

    @Transactional
    public boolean delete(Long id) {
        if (readingRecordRepository.existsById(id)) {
            readingRecordRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private ReadingRecordDTO convertToDTO(ReadingRecord record) {
        ReadingRecordDTO dto = new ReadingRecordDTO();
        dto.setId(record.getId());
        dto.setBookListId(record.getBookList().getId());
        dto.setReadDate(record.getReadDate());
        dto.setDurationMinutes(record.getDurationMinutes());
        dto.setPagesRead(record.getPagesRead());
        dto.setNote(record.getNote());
        dto.setCreatedAt(record.getCreatedAt());
        return dto;
    }
}
