package com.wiki.knowledgebase.service;

import com.wiki.knowledgebase.entity.Document;
import com.wiki.knowledgebase.entity.DocumentVersion;
import com.wiki.knowledgebase.repository.DocumentRepository;
import com.wiki.knowledgebase.repository.DocumentVersionRepository;
import lombok.RequiredArgsConstructor;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final Parser markdownParser;
    private final HtmlRenderer htmlRenderer;

    public List<Document> getDocumentTree(Long spaceId) {
        return documentRepository.findBySpaceIdAndStatusOrderByDepthAscSortOrderAsc(spaceId, 1);
    }

    public List<Document> getChildren(Long spaceId, Long parentId) {
        return documentRepository.findBySpaceIdAndParentIdAndStatusOrderBySortOrderAsc(spaceId, parentId, 1);
    }

    public Optional<Document> getById(Long id) {
        return documentRepository.findByIdAndStatus(id, 1);
    }

    @Transactional
    public Document createDocument(Document document, Long userId) {
        document.setContentHtml(markdownToHtml(document.getContent()));
        document.setCreatorId(userId);
        document.setLastEditorId(userId);
        document.setVersion(1);
        document.setStatus(1);
        
        if (document.getParentId() != null) {
            Document parent = documentRepository.findById(document.getParentId())
                    .orElseThrow(() -> new RuntimeException("父文档不存在"));
            document.setDepth(parent.getDepth() + 1);
            document.setPath(parent.getPath() + "/" + document.getTitle());
        } else {
            document.setDepth(0);
            document.setPath("/" + document.getTitle());
        }
        
        Document saved = documentRepository.save(document);
        
        DocumentVersion version = new DocumentVersion();
        version.setDocumentId(saved.getId());
        version.setVersion(1);
        version.setTitle(saved.getTitle());
        version.setContent(saved.getContent());
        version.setContentHtml(saved.getContentHtml());
        version.setEditorId(userId);
        version.setEditSummary("创建文档");
        documentVersionRepository.save(version);
        
        return saved;
    }

    @Transactional
    public Document updateDocument(Long id, Document document, Long userId, String editSummary) {
        Document existing = documentRepository.findByIdAndStatus(id, 1)
                .orElseThrow(() -> new RuntimeException("文档不存在"));

        int newVersion = existing.getVersion() + 1;

        Optional<DocumentVersion> existingVersion = documentVersionRepository
                .findByDocumentIdAndVersion(id, existing.getVersion());
        if (existingVersion.isEmpty()) {
            DocumentVersion oldVersion = new DocumentVersion();
            oldVersion.setDocumentId(id);
            oldVersion.setVersion(existing.getVersion());
            oldVersion.setTitle(existing.getTitle());
            oldVersion.setContent(existing.getContent());
            oldVersion.setContentHtml(existing.getContentHtml());
            oldVersion.setEditorId(existing.getLastEditorId() != null ? existing.getLastEditorId() : existing.getCreatorId());
            oldVersion.setEditSummary("保存历史版本");
            documentVersionRepository.save(oldVersion);
        }
        
        existing.setTitle(document.getTitle());
        existing.setContent(document.getContent());
        existing.setContentHtml(markdownToHtml(document.getContent()));
        existing.setLastEditorId(userId);
        existing.setVersion(newVersion);
        
        if (!existing.getTitle().equals(document.getTitle())) {
            updatePath(existing);
        }
        
        DocumentVersion version = new DocumentVersion();
        version.setDocumentId(id);
        version.setVersion(newVersion);
        version.setTitle(existing.getTitle());
        version.setContent(existing.getContent());
        version.setContentHtml(existing.getContentHtml());
        version.setEditorId(userId);
        version.setEditSummary(editSummary != null ? editSummary : "更新文档");
        documentVersionRepository.save(version);
        
        return documentRepository.save(existing);
    }

    private void updatePath(Document document) {
        if (document.getParentId() != null) {
            Document parent = documentRepository.findById(document.getParentId()).orElse(null);
            if (parent != null) {
                document.setPath(parent.getPath() + "/" + document.getTitle());
            }
        } else {
            document.setPath("/" + document.getTitle());
        }
        updateChildrenPath(document.getId(), document.getPath());
    }

    private void updateChildrenPath(Long parentId, String parentPath) {
        List<Document> children = documentRepository.findBySpaceIdAndParentIdAndStatusOrderBySortOrderAsc(
                documentRepository.findById(parentId).get().getSpaceId(), parentId, 1);
        for (Document child : children) {
            child.setPath(parentPath + "/" + child.getTitle());
            documentRepository.save(child);
            updateChildrenPath(child.getId(), child.getPath());
        }
    }

    @Transactional
    public void deleteDocument(Long id) {
        Document document = documentRepository.findByIdAndStatus(id, 1)
                .orElseThrow(() -> new RuntimeException("文档不存在"));
        document.setStatus(0);
        document.setDeletedAt(LocalDateTime.now());
        documentRepository.save(document);
    }

    @Transactional
    public void restoreDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文档不存在"));
        document.setStatus(1);
        document.setDeletedAt(null);
        documentRepository.save(document);
    }

    public List<Document> search(String keyword) {
        return documentRepository.searchByKeyword(keyword);
    }

    public List<DocumentVersion> getVersions(Long documentId) {
        return documentVersionRepository.findByDocumentIdOrderByVersionDesc(documentId);
    }

    public Optional<DocumentVersion> getVersion(Long documentId, Integer version) {
        return documentVersionRepository.findByDocumentIdAndVersion(documentId, version);
    }

    public List<Document> getRecycledDocuments(Long spaceId) {
        return documentRepository.findRecycledBySpaceId(spaceId);
    }

    private String markdownToHtml(String markdown) {
        if (markdown == null) {
            return "";
        }
        Node document = markdownParser.parse(markdown);
        return htmlRenderer.render(document);
    }
}
