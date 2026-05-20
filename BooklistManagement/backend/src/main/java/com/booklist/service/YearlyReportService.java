package com.booklist.service;

import com.booklist.dto.BookListDTO;
import com.booklist.dto.TagDTO;
import com.booklist.dto.YearlyReportDTO;
import com.booklist.entity.BookList;
import com.booklist.entity.BookListStatus;
import com.booklist.entity.ReadingRecord;
import com.booklist.repository.BookListRepository;
import com.booklist.repository.ReadingRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class YearlyReportService {

    private final BookListRepository bookListRepository;
    private final ReadingRecordRepository readingRecordRepository;
    private final BookListService bookListService;

    public YearlyReportDTO generateYearlyReport(int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        YearlyReportDTO report = new YearlyReportDTO();
        report.setYear(year);

        List<BookList> finishedBooks = bookListRepository.findFinishedBooksByYear(startDate, endDate);
        report.setBooksFinished(finishedBooks.size());

        List<BookList> readingBooks = bookListRepository.findReadingBooksByYear(endDate);
        report.setBooksReading(readingBooks.size());

        long wishlistCount = bookListRepository.countByStatus(BookListStatus.WISHLIST);
        report.setBooksInWishlist((int) wishlistCount);

        Integer totalMinutes = readingRecordRepository.sumDurationByDateRange(startDate, endDate);
        int totalReadingMinutes = totalMinutes != null ? totalMinutes : 0;
        report.setTotalReadingMinutes(totalReadingMinutes);
        report.setTotalReadingHours((double) totalReadingMinutes / 60);

        if (!finishedBooks.isEmpty()) {
            double avgRating = finishedBooks.stream()
                    .filter(bl -> bl.getRating() != null)
                    .mapToInt(BookList::getRating)
                    .average()
                    .orElse(0.0);
            report.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
        }

        int totalPages = 0;
        for (BookList bl : finishedBooks) {
            if (bl.getBook() != null && bl.getBook().getPages() != null) {
                totalPages += bl.getBook().getPages();
            }
        }
        report.setTotalPagesRead(totalPages);

        Map<String, Integer> tagCount = new HashMap<>();
        List<BookListDTO> finishedBookDTOs = new ArrayList<>();
        for (BookList bl : finishedBooks) {
            BookListDTO dto = bookListService.findById(bl.getId()).orElse(null);
            if (dto != null) {
                finishedBookDTOs.add(dto);
                if (dto.getTags() != null) {
                    for (TagDTO tag : dto.getTags()) {
                        tagCount.merge(tag.getName(), 1, Integer::sum);
                    }
                }
            }
        }
        report.setFinishedBooks(finishedBookDTOs);

        List<Map.Entry<String, Integer>> sortedTags = tagCount.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Integer> topTags = new LinkedHashMap<>();
        for (Map.Entry<String, Integer> entry : sortedTags) {
            topTags.put(entry.getKey(), entry.getValue());
        }
        report.setTopTags(topTags);

        Map<String, Integer> monthlyReading = new LinkedHashMap<>();
        for (int i = 1; i <= 12; i++) {
            monthlyReading.put(String.valueOf(i), 0);
        }

        List<ReadingRecord> records = readingRecordRepository.findByDateRange(startDate, endDate);
        for (ReadingRecord record : records) {
            String month = String.valueOf(record.getReadDate().getMonthValue());
            monthlyReading.merge(month, record.getDurationMinutes(), Integer::sum);
        }
        report.setMonthlyReadingMinutes(monthlyReading);

        Map<String, Integer> authorCount = new HashMap<>();
        for (BookList bl : finishedBooks) {
            if (bl.getBook() != null && bl.getBook().getAuthor() != null) {
                String[] authors = bl.getBook().getAuthor().split(",");
                for (String author : authors) {
                    authorCount.merge(author.trim(), 1, Integer::sum);
                }
            }
        }

        List<Map.Entry<String, Integer>> sortedAuthors = authorCount.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(3)
                .collect(Collectors.toList());

        Map<String, Integer> topAuthors = new LinkedHashMap<>();
        for (Map.Entry<String, Integer> entry : sortedAuthors) {
            topAuthors.put(entry.getKey(), entry.getValue());
        }
        report.setTopAuthors(topAuthors);

        return report;
    }
}
