package com.reading.notes.service;

import com.reading.notes.entity.Book;
import com.reading.notes.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> findAll() {
        return bookRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }

    public Book save(Book book) {
        return bookRepository.save(book);
    }

    public void delete(Long id) {
        bookRepository.deleteById(id);
    }

    public Book update(Long id, Book book) {
        Book existing = bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Book not found"));
        existing.setTitle(book.getTitle());
        existing.setAuthor(book.getAuthor());
        existing.setCoverUrl(book.getCoverUrl());
        existing.setTotalPages(book.getTotalPages());
        existing.setCurrentPage(book.getCurrentPage());
        existing.setStatus(book.getStatus());
        existing.setIsbn(book.getIsbn());
        existing.setDescription(book.getDescription());
        return bookRepository.save(existing);
    }
}
