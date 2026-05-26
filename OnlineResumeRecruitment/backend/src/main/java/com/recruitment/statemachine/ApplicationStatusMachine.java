package com.recruitment.statemachine;

import com.recruitment.enums.ApplicationStatusEnum;
import com.recruitment.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
public class ApplicationStatusMachine {

    private static final Map<String, Set<String>> TRANSITION_RULES;
    static {
        TRANSITION_RULES = new HashMap<>();
        TRANSITION_RULES.put(ApplicationStatusEnum.PENDING.name(), new HashSet<>(Arrays.asList(
            ApplicationStatusEnum.VIEWED.name(),
            ApplicationStatusEnum.REJECTED.name()
        )));
        TRANSITION_RULES.put(ApplicationStatusEnum.VIEWED.name(), new HashSet<>(Arrays.asList(
            ApplicationStatusEnum.PASSED.name(),
            ApplicationStatusEnum.REJECTED.name()
        )));
        TRANSITION_RULES.put(ApplicationStatusEnum.PASSED.name(), new HashSet<>(Arrays.asList(
            ApplicationStatusEnum.INTERVIEW.name(),
            ApplicationStatusEnum.REJECTED.name(),
            ApplicationStatusEnum.OFFER.name()
        )));
        TRANSITION_RULES.put(ApplicationStatusEnum.INTERVIEW.name(), new HashSet<>(Arrays.asList(
            ApplicationStatusEnum.OFFER.name(),
            ApplicationStatusEnum.REJECTED.name(),
            ApplicationStatusEnum.HIRED.name()
        )));
        TRANSITION_RULES.put(ApplicationStatusEnum.OFFER.name(), new HashSet<>(Arrays.asList(
            ApplicationStatusEnum.HIRED.name(),
            ApplicationStatusEnum.REJECTED.name()
        )));
        TRANSITION_RULES.put(ApplicationStatusEnum.HIRED.name(), new HashSet<>());
        TRANSITION_RULES.put(ApplicationStatusEnum.REJECTED.name(), new HashSet<>());
    }

    public boolean canTransition(String fromStatus, String toStatus) {
        if (fromStatus == null || toStatus == null) {
            return false;
        }
        Set<String> allowedTransitions = TRANSITION_RULES.get(fromStatus);
        return allowedTransitions != null && allowedTransitions.contains(toStatus);
    }

    public void validateTransition(Long applicationId, String fromStatus, String toStatus) {
        if (!canTransition(fromStatus, toStatus)) {
            throw new BusinessException(
                String.format("投递记录[%d]状态流转不合法: %s -> %s",
                    applicationId, fromStatus, toStatus)
            );
        }
    }
}
