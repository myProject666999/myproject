package com.gtd.service;

import com.gtd.entity.Context;
import com.gtd.repository.ContextRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContextService {

    @Autowired
    private ContextRepository contextRepository;

    public List<Context> getAllContexts(Long userId) {
        return contextRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Context> getContextById(Long id) {
        return contextRepository.findById(id);
    }

    public Context createContext(Context context) {
        return contextRepository.save(context);
    }

    public Context updateContext(Context context) {
        return contextRepository.save(context);
    }

    public void deleteContext(Long id) {
        contextRepository.deleteById(id);
    }
}
