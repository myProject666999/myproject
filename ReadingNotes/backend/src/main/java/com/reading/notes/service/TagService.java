package com.reading.notes.service;

import com.reading.notes.entity.Tag;
import com.reading.notes.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    public List<Tag> findAll() {
        return tagRepository.findAll();
    }

    public Optional<Tag> findById(Long id) {
        return tagRepository.findById(id);
    }

    public Tag save(Tag tag) {
        Optional<Tag> existing = tagRepository.findByName(tag.getName());
        return existing.orElseGet(() -> tagRepository.save(tag));
    }

    public void delete(Long id) {
        tagRepository.deleteById(id);
    }

    public Tag update(Long id, Tag tag) {
        Tag existing = tagRepository.findById(id).orElseThrow(() -> new RuntimeException("Tag not found"));
        existing.setName(tag.getName());
        existing.setColor(tag.getColor());
        return tagRepository.save(existing);
    }
}
