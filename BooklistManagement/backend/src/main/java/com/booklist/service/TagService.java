package com.booklist.service;

import com.booklist.dto.TagDTO;
import com.booklist.entity.Tag;
import com.booklist.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public List<TagDTO> findAll() {
        return tagRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<TagDTO> findById(Long id) {
        return tagRepository.findById(id).map(this::convertToDTO);
    }

    public Optional<TagDTO> findByName(String name) {
        return tagRepository.findByName(name).map(this::convertToDTO);
    }

    @Transactional
    public TagDTO create(TagDTO dto) {
        Tag tag = new Tag();
        tag.setName(dto.getName());
        tag.setColor(dto.getColor() != null ? dto.getColor() : "#409EFF");
        tag = tagRepository.save(tag);
        return convertToDTO(tag);
    }

    @Transactional
    public Optional<TagDTO> update(Long id, TagDTO dto) {
        return tagRepository.findById(id).map(tag -> {
            if (dto.getName() != null) {
                tag.setName(dto.getName());
            }
            if (dto.getColor() != null) {
                tag.setColor(dto.getColor());
            }
            return convertToDTO(tagRepository.save(tag));
        });
    }

    @Transactional
    public boolean delete(Long id) {
        if (tagRepository.existsById(id)) {
            tagRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private TagDTO convertToDTO(Tag tag) {
        TagDTO dto = new TagDTO();
        dto.setId(tag.getId());
        dto.setName(tag.getName());
        dto.setColor(tag.getColor());
        dto.setCreatedAt(tag.getCreatedAt());
        return dto;
    }
}
