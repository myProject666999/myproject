package com.recipebook.service;

import com.recipebook.entity.Season;
import com.recipebook.repository.SeasonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeasonService {

    private final SeasonRepository seasonRepository;

    @Transactional(readOnly = true)
    public List<Season> getAllSeasons() {
        return seasonRepository.findAllByOrderByIdAsc();
    }
}
