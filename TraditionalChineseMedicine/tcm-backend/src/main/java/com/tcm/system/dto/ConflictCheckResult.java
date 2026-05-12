package com.tcm.system.dto;

import lombok.Data;
import java.util.List;

@Data
public class ConflictCheckResult {
    private boolean hasConflict;
    private List<ConflictInfo> conflicts;

    @Data
    public static class ConflictInfo {
        private String herbAName;
        private String herbBName;
        private Integer conflictType;
        private String conflictTypeName;
        private String description;
    }
}
