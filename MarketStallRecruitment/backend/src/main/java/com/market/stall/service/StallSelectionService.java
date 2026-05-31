package com.market.stall.service;

import com.market.stall.dto.StallSelectDTO;

public interface StallSelectionService {

    String selectStall(StallSelectDTO dto, Long userId);

    void releaseExpiredLocks();

    void confirmStall(Long registrationId, Long userId);
}
