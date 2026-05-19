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
public class PageService {

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private RecycleBinRepository recycleBinRepository;

    public List<Page> getPagesBySectionId(Long sectionId) {
        return pageRepository.findBySectionIdOrderBySortOrderAsc(sectionId);
    }

    public List<Page> getFavoritePages() {
        return pageRepository.findByIsFavoriteTrueOrderByUpdatedAtDesc();
    }

    public List<Page> searchPages(String keyword) {
        return pageRepository.searchByKeyword(keyword);
    }

    public Optional<Page> getPageById(Long id) {
        return pageRepository.findById(id);
    }

    public Page createPage(Page page) {
        return pageRepository.save(page);
    }

    public Page updatePage(Long id, Page pageDetails) {
        return pageRepository.findById(id).map(page -> {
            page.setTitle(pageDetails.getTitle());
            page.setContent(pageDetails.getContent());
            page.setIsFavorite(pageDetails.getIsFavorite());
            return pageRepository.save(page);
        }).orElseThrow(() -> new RuntimeException("Page not found"));
    }

    @Transactional
    public void moveToRecycleBin(Long id) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Page not found"));
        
        RecycleBin recycleBin = new RecycleBin();
        recycleBin.setPageId(page.getId());
        recycleBin.setSectionId(page.getSectionId());
        recycleBin.setTitle(page.getTitle());
        recycleBin.setContent(page.getContent());
        recycleBinRepository.save(recycleBin);
        
        pageRepository.delete(page);
    }

    public Page toggleFavorite(Long id) {
        return pageRepository.findById(id).map(page -> {
            page.setIsFavorite(!page.getIsFavorite());
            return pageRepository.save(page);
        }).orElseThrow(() -> new RuntimeException("Page not found"));
    }
}
