package com.recruitment.statemachine;

import com.recruitment.enums.ApplicationStatusEnum;
import com.recruitment.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class ApplicationStatusMachine {

    private static final Map<String, Set<String>> TRANSITION_RULES = Map.of(
        ApplicationStatusEnum.PENDING.name(), Set.of(
            ApplicationStatusEnum.VIEWED.name(),
            ApplicationStatusEnum.REJECTED.name()
        ),
        ApplicationStatusEnum.VIEWED.name(), Set.of(
            ApplicationStatusEnum.PASSED.name(),
            ApplicationStatusEnum.REJECTED.name()
        ),
        ApplicationStatusEnum.PASSED.name(), Set.of(
            ApplicationStatusEnum.INTERVIEW.name(),
            ApplicationStatusEnum.REJECTED.name(),
            ApplicationStatusEnum.OFFER.name()
        ),
        ApplicationStatusEnum.INTERVIEW.name(), Set.of(
            ApplicationStatusEnum.OFFER.name(),
            ApplicationStatusEnum.REJECTED.name(),
            ApplicationStatusEnum.HIRED.name()
        ),
        ApplicationStatusEnum.OFFER.name(), Set.of(
            ApplicationStatusEnum.HIRED.name(),
            ApplicationStatusEnum.REJECTED.name()
        ),
        ApplicationStatusEnum.HIRED.name(), Set.of(),
        ApplicationStatusEnum.REJECTED.name(), Set.of()
    );

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
