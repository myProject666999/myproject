package com.construction.company.service;

import com.construction.company.entity.Acceptance;

import java.util.List;

public interface AcceptanceService {
    boolean save(Acceptance acceptance);
    boolean updateById(Acceptance acceptance);
    boolean removeById(Long id);
    Acceptance getById(Long id);
    List<Acceptance> list();
}
