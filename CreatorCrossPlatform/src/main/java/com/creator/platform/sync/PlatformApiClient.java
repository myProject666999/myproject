package com.creator.platform.sync;

import com.creator.platform.dto.PlatformAccountDataDTO;
import com.creator.platform.dto.PlatformContentDTO;

import java.time.LocalDate;
import java.util.List;

public interface PlatformApiClient {

    String getPlatformCode();

    PlatformAccountDataDTO fetchAccountData(String platformAccountId, String accessToken) throws Exception;

    List<PlatformContentDTO> fetchContentList(String platformAccountId, String accessToken, LocalDate startDate, LocalDate endDate) throws Exception;
}
