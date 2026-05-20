package com.booklist.service;

import com.booklist.dto.BookDTO;
import com.booklist.entity.Book;
import com.booklist.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public List<BookDTO> findAll() {
        return bookRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<BookDTO> findById(Long id) {
        return bookRepository.findById(id).map(this::convertToDTO);
    }

    public Optional<BookDTO> findByIsbn(String isbn) {
        return bookRepository.findByIsbn(isbn).map(this::convertToDTO);
    }

    @Transactional
    public BookDTO create(BookDTO dto) {
        Book book = convertToEntity(dto);
        book = bookRepository.save(book);
        return convertToDTO(book);
    }

    @Transactional
    public Optional<BookDTO> update(Long id, BookDTO dto) {
        return bookRepository.findById(id).map(book -> {
            book.setIsbn(dto.getIsbn());
            book.setTitle(dto.getTitle());
            book.setSubtitle(dto.getSubtitle());
            book.setAuthor(dto.getAuthor());
            book.setTranslator(dto.getTranslator());
            book.setPublisher(dto.getPublisher());
            book.setPublishDate(dto.getPublishDate());
            book.setPages(dto.getPages());
            book.setPrice(dto.getPrice());
            book.setCurrency(dto.getCurrency());
            book.setBinding(dto.getBinding());
            book.setSummary(dto.getSummary());
            book.setCoverUrl(dto.getCoverUrl());
            return convertToDTO(bookRepository.save(book));
        });
    }

    @Transactional
    public boolean delete(Long id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Book findOrCreateBook(BookDTO dto) {
        if (dto.getIsbn() != null && !dto.getIsbn().isEmpty()) {
            Optional<Book> existingBook = bookRepository.findByIsbn(dto.getIsbn());
            if (existingBook.isPresent()) {
                return existingBook.get();
            }
        }
        Book book = convertToEntity(dto);
        return bookRepository.save(book);
    }

    private BookDTO convertToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setIsbn(book.getIsbn());
        dto.setTitle(book.getTitle());
        dto.setSubtitle(book.getSubtitle());
        dto.setAuthor(book.getAuthor());
        dto.setTranslator(book.getTranslator());
        dto.setPublisher(book.getPublisher());
        dto.setPublishDate(book.getPublishDate());
        dto.setPages(book.getPages());
        dto.setPrice(book.getPrice());
        dto.setCurrency(book.getCurrency());
        dto.setBinding(book.getBinding());
        dto.setSummary(book.getSummary());
        dto.setCoverUrl(book.getCoverUrl());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());
        return dto;
    }

    private Book convertToEntity(BookDTO dto) {
        Book book = new Book();
        book.setId(dto.getId());
        book.setIsbn(dto.getIsbn());
        book.setTitle(dto.getTitle());
        book.setSubtitle(dto.getSubtitle());
        book.setAuthor(dto.getAuthor());
        book.setTranslator(dto.getTranslator());
        book.setPublisher(dto.getPublisher());
        book.setPublishDate(dto.getPublishDate());
        book.setPages(dto.getPages());
        book.setPrice(dto.getPrice());
        book.setCurrency(dto.getCurrency());
        book.setBinding(dto.getBinding());
        book.setSummary(dto.getSummary());
        book.setCoverUrl(dto.getCoverUrl());
        return book;
    }
}
