package com.creator.platform.normalize;

import com.creator.platform.dto.PlatformAccountDataDTO;
import com.creator.platform.dto.PlatformContentDTO;
import com.creator.platform.dto.UnifiedMetricsDTO;
import com.creator.platform.enums.PlatformCodeEnum;

public interface PlatformDataNormalizer {

    PlatformCodeEnum getPlatformCode();

    UnifiedMetricsDTO normalizeAccountData(PlatformAccountDataDTO rawData);

    UnifiedMetricsDTO normalizeContentData(PlatformContentDTO rawData);
}
