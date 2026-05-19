package com.notebook.service;

import com.notebook.entity.Page;
import com.notebook.entity.RecycleBin;
import com.notebook.repository.PageRepository;
import com.notebook.repository.RecycleBinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RecycleBinService {

    @Autowired
    private RecycleBinRepository recycleBinRepository;

    @Autowired
    private PageRepository pageRepository;

    public List<RecycleBin> getAllDeletedPages() {
        return recycleBinRepository.findAllByOrderByDeletedAtDesc();
    }

    public Optional<RecycleBin> getById(Long id) {
        return recycleBinRepository.findById(id);
    }

    @Transactional
    public Page restorePage(Long recycleBinId) {
        RecycleBin recycleBin = recycleBinRepository.findById(recycleBinId)
                .orElseThrow(() -> new RuntimeException("Recycle bin entry not found"));

        Page page = new Page();
        page.setSectionId(recycleBin.getSectionId());
        page.setTitle(recycleBin.getTitle());
        page.setContent(recycleBin.getContent());
        page.setIsFavorite(false);
        
        Page restoredPage = pageRepository.save(page);
        recycleBinRepository.delete(recycleBin);
        
        return restoredPage;
    }

    public void permanentDelete(Long id) {
        recycleBinRepository.deleteById(id);
    }

    public void clearAll() {
        recycleBinRepository.deleteAll();
    }
}
