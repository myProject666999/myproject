package com.paper.service;

import com.paper.dto.TagDTO;
import com.paper.dto.TagRequest;
import com.paper.entity.Tag;
import com.paper.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    public List<TagDTO> findAll() {
        return tagRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TagDTO findById(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("标签不存在"));
        return convertToDTO(tag);
    }

    @Transactional
    public TagDTO create(TagRequest request) {
        if (tagRepository.existsByName(request.getName().trim())) {
            throw new RuntimeException("标签已存在");
        }
        Tag tag = new Tag();
        tag.setName(request.getName().trim());
        if (request.getColor() != null && !request.getColor().trim().isEmpty()) {
            tag.setColor(request.getColor().trim());
        }
        tag = tagRepository.save(tag);
        return convertToDTO(tag);
    }

    @Transactional
    public TagDTO update(Long id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("标签不存在"));
        if (!tag.getName().equals(request.getName().trim()) && 
            tagRepository.existsByName(request.getName().trim())) {
            throw new RuntimeException("标签已存在");
        }
        tag.setName(request.getName().trim());
        if (request.getColor() != null && !request.getColor().trim().isEmpty()) {
            tag.setColor(request.getColor().trim());
        }
        tag = tagRepository.save(tag);
        return convertToDTO(tag);
    }

    @Transactional
    public void delete(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new RuntimeException("标签不存在");
        }
        tagRepository.deleteById(id);
    }

    private TagDTO convertToDTO(Tag tag) {
        TagDTO dto = new TagDTO();
        dto.setId(tag.getId());
        dto.setName(tag.getName());
        dto.setColor(tag.getColor());
        return dto;
    }
}
