package com.port.container.exception;

import lombok.Getter;

import java.util.List;

@Getter
public class TaskConflictException extends RuntimeException {

    private List<Long> conflictingTaskIds;

    public TaskConflictException(String message) {
        super(message);
    }

    public TaskConflictException(String message, List<Long> conflictingTaskIds) {
        super(message);
        this.conflictingTaskIds = conflictingTaskIds;
    }
}
