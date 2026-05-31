package com.market.stall.vo;

import lombok.Data;

import java.util.List;

@Data
public class StallMapVO {

    private Long eventId;

    private List<ZoneVO> zones;

    @Data
    public static class ZoneVO {

        private String zone;

        private List<StallVO> stalls;
    }
}
