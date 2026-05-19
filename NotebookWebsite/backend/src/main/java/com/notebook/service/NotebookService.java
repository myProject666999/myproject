package com.notebook.service;

import com.notebook.entity.Notebook;
import com.notebook.repository.NotebookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotebookService {

    @Autowired
    private NotebookRepository notebookRepository;

    public List<Notebook> getAllNotebooks() {
        return notebookRepository.findByUserIdOrderBySortOrderAsc(1L);
    }

    public Optional<Notebook> getNotebookById(Long id) {
        return notebookRepository.findById(id);
    }

    public Notebook createNotebook(Notebook notebook) {
        notebook.setUserId(1L);
        return notebookRepository.save(notebook);
    }

    public Notebook updateNotebook(Long id, Notebook notebookDetails) {
        return notebookRepository.findById(id).map(notebook -> {
            notebook.setName(notebookDetails.getName());
            notebook.setDescription(notebookDetails.getDescription());
            return notebookRepository.save(notebook);
        }).orElseThrow(() -> new RuntimeException("Notebook not found"));
    }

    public void deleteNotebook(Long id) {
        notebookRepository.deleteById(id);
    }
}
