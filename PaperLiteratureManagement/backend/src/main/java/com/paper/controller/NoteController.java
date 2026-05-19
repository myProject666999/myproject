package com.paper.controller;

import com.paper.dto.ApiResponse;
import com.paper.dto.NoteDTO;
import com.paper.dto.NoteRequest;
import com.paper.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @GetMapping
    public ApiResponse<List<NoteDTO>> findAll() {
        return ApiResponse.success(noteService.findAll());
    }

    @GetMapping("/paper/{paperId}")
    public ApiResponse<List<NoteDTO>> findByPaperId(@PathVariable Long paperId) {
        return ApiResponse.success(noteService.findByPaperId(paperId));
    }

    @GetMapping("/{id}")
    public ApiResponse<NoteDTO> findById(@PathVariable Long id) {
        return ApiResponse.success(noteService.findById(id));
    }

    @PostMapping
    public ApiResponse<NoteDTO> create(@Valid @RequestBody NoteRequest request) {
        return ApiResponse.success("创建成功", noteService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<NoteDTO> update(@PathVariable Long id, @Valid @RequestBody NoteRequest request) {
        return ApiResponse.success("更新成功", noteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        noteService.delete(id);
        return ApiResponse.success("删除成功", null);
    }
}
