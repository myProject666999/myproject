package com.booklist.service;

import com.booklist.dto.BookDTO;
import com.booklist.dto.BookListDTO;
import com.booklist.dto.TagDTO;
import com.booklist.entity.Book;
import com.booklist.entity.BookList;
import com.booklist.entity.BookListStatus;
import com.booklist.entity.BookTag;
import com.booklist.entity.Tag;
import com.booklist.repository.BookListRepository;
import com.booklist.repository.BookTagRepository;
import com.booklist.repository.ReadingRecordRepository;
import com.booklist.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookListService {

    private final BookListRepository bookListRepository;
    private final BookTagRepository bookTagRepository;
    private final TagRepository tagRepository;
    private final BookService bookService;
    private final ReadingRecordRepository readingRecordRepository;

    public List<BookListDTO> findAll() {
        return bookListRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookListDTO> findByStatus(BookListStatus status) {
        return bookListRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<BookListDTO> findById(Long id) {
        return bookListRepository.findById(id).map(this::convertToDTO);
    }

    @Transactional
    public BookListDTO create(BookListDTO dto) {
        Book book = bookService.findOrCreateBook(dto.getBook());
        BookList bookList = new BookList();
        bookList.setBook(book);
        bookList.setStatus(dto.getStatus() != null ? dto.getStatus() : BookListStatus.WISHLIST);
        bookList.setRating(dto.getRating());
        bookList.setReview(dto.getReview());
        bookList.setStartDate(dto.getStartDate());
        bookList.setEndDate(dto.getEndDate());

        if (bookList.getStatus() == BookListStatus.READING && bookList.getStartDate() == null) {
            bookList.setStartDate(LocalDate.now());
        }

        bookList = bookListRepository.save(bookList);

        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            saveBookTags(bookList.getId(), dto.getTags());
        }

        return convertToDTO(bookList);
    }

    @Transactional
    public Optional<BookListDTO> update(Long id, BookListDTO dto) {
        return bookListRepository.findById(id).map(bookList -> {
            if (dto.getStatus() != null) {
                BookListStatus oldStatus = bookList.getStatus();
                BookListStatus newStatus = dto.getStatus();

                if (oldStatus != BookListStatus.READING && newStatus == BookListStatus.READING && bookList.getStartDate() == null) {
                    bookList.setStartDate(LocalDate.now());
                }
                if (oldStatus != BookListStatus.FINISHED && newStatus == BookListStatus.FINISHED && bookList.getEndDate() == null) {
                    bookList.setEndDate(LocalDate.now());
                }

                bookList.setStatus(newStatus);
            }

            if (dto.getRating() != null) {
                bookList.setRating(dto.getRating());
            }
            if (dto.getReview() != null) {
                bookList.setReview(dto.getReview());
            }
            if (dto.getStartDate() != null) {
                bookList.setStartDate(dto.getStartDate());
            }
            if (dto.getEndDate() != null) {
                bookList.setEndDate(dto.getEndDate());
            }

            if (dto.getTags() != null) {
                bookTagRepository.deleteByBookListId(bookList.getId());
                saveBookTags(bookList.getId(), dto.getTags());
            }

            return convertToDTO(bookListRepository.save(bookList));
        });
    }

    @Transactional
    public Optional<BookListDTO> updateStatus(Long id, BookListStatus status) {
        return bookListRepository.findById(id).map(bookList -> {
            BookListStatus oldStatus = bookList.getStatus();

            if (oldStatus != BookListStatus.READING && status == BookListStatus.READING && bookList.getStartDate() == null) {
                bookList.setStartDate(LocalDate.now());
            }
            if (oldStatus != BookListStatus.FINISHED && status == BookListStatus.FINISHED && bookList.getEndDate() == null) {
                bookList.setEndDate(LocalDate.now());
            }

            bookList.setStatus(status);
            return convertToDTO(bookListRepository.save(bookList));
        });
    }

    @Transactional
    public boolean delete(Long id) {
        if (bookListRepository.existsById(id)) {
            bookTagRepository.deleteByBookListId(id);
            bookListRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private void saveBookTags(Long bookListId, List<TagDTO> tags) {
        for (TagDTO tagDTO : tags) {
            Tag tag;
            if (tagDTO.getId() != null) {
                tag = tagRepository.findById(tagDTO.getId()).orElseGet(() -> createTag(tagDTO));
            } else if (tagDTO.getName() != null) {
                tag = tagRepository.findByName(tagDTO.getName()).orElseGet(() -> createTag(tagDTO));
            } else {
                continue;
            }

            if (bookTagRepository.findByBookListIdAndTagId(bookListId, tag.getId()).isEmpty()) {
                BookTag bookTag = new BookTag();
                bookTag.setBookListId(bookListId);
                bookTag.setTag(tag);
                bookTagRepository.save(bookTag);
            }
        }
    }

    private Tag createTag(TagDTO dto) {
        Tag tag = new Tag();
        tag.setName(dto.getName());
        tag.setColor(dto.getColor() != null ? dto.getColor() : "#409EFF");
        return tagRepository.save(tag);
    }

    private BookListDTO convertToDTO(BookList bookList) {
        BookListDTO dto = new BookListDTO();
        dto.setId(bookList.getId());

        BookDTO bookDTO = new BookDTO();
        Book book = bookList.getBook();
        bookDTO.setId(book.getId());
        bookDTO.setIsbn(book.getIsbn());
        bookDTO.setTitle(book.getTitle());
        bookDTO.setSubtitle(book.getSubtitle());
        bookDTO.setAuthor(book.getAuthor());
        bookDTO.setTranslator(book.getTranslator());
        bookDTO.setPublisher(book.getPublisher());
        bookDTO.setPublishDate(book.getPublishDate());
        bookDTO.setPages(book.getPages());
        bookDTO.setPrice(book.getPrice());
        bookDTO.setCurrency(book.getCurrency());
        bookDTO.setBinding(book.getBinding());
        bookDTO.setSummary(book.getSummary());
        bookDTO.setCoverUrl(book.getCoverUrl());
        dto.setBook(bookDTO);

        dto.setStatus(bookList.getStatus());
        dto.setRating(bookList.getRating());
        dto.setReview(bookList.getReview());
        dto.setStartDate(bookList.getStartDate());
        dto.setEndDate(bookList.getEndDate());
        dto.setCreatedAt(bookList.getCreatedAt());
        dto.setUpdatedAt(bookList.getUpdatedAt());

        List<TagDTO> tags = bookTagRepository.findByBookListIdWithTag(bookList.getId()).stream()
                .map(bookTag -> {
                    TagDTO tagDTO = new TagDTO();
                    Tag tag = bookTag.getTag();
                    tagDTO.setId(tag.getId());
                    tagDTO.setName(tag.getName());
                    tagDTO.setColor(tag.getColor());
                    return tagDTO;
                })
                .collect(Collectors.toList());
        dto.setTags(tags);

        Integer totalMinutes = readingRecordRepository.sumDurationByBookListId(bookList.getId());
        dto.setTotalReadingMinutes(totalMinutes != null ? totalMinutes : 0);

        return dto;
    }
}
