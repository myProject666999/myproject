package com.market.stall.service;

import com.market.stall.dto.CheckInDTO;
import com.market.stall.vo.CheckInVO;

import java.util.List;

public interface CheckInService {

    String generateCheckInCode(Long registrationId, Long userId);

    CheckInVO checkIn(CheckInDTO dto, Long verifierId);

    List<CheckInVO> getCheckInList(Long eventId);
}
