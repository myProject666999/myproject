package com.oj.common;

public interface Constants {

    interface UserRole {
        int NORMAL = 0;
        int ADMIN = 1;
    }

    interface UserStatus {
        int DISABLED = 0;
        int NORMAL = 1;
    }

    interface ProblemStatus {
        int HIDDEN = 0;
        int PUBLIC = 1;
    }

    interface ProblemDifficulty {
        int EASY = 1;
        int MEDIUM = 2;
        int HARD = 3;
    }

    interface SubmissionStatus {
        int PENDING = 0;
        int JUDGING = 1;
        int ACCEPTED = 2;
        int WRONG_ANSWER = 3;
        int TIME_LIMIT_EXCEEDED = 4;
        int MEMORY_LIMIT_EXCEEDED = 5;
        int RUNTIME_ERROR = 6;
        int COMPILE_ERROR = 7;
        int SYSTEM_ERROR = 8;
    }

    interface SubmissionStatusText {
        String PENDING = "Pending";
        String JUDGING = "Judging";
        String ACCEPTED = "Accepted";
        String WRONG_ANSWER = "Wrong Answer";
        String TIME_LIMIT_EXCEEDED = "Time Limit Exceeded";
        String MEMORY_LIMIT_EXCEEDED = "Memory Limit Exceeded";
        String RUNTIME_ERROR = "Runtime Error";
        String COMPILE_ERROR = "Compile Error";
        String SYSTEM_ERROR = "System Error";
    }

    interface ContestType {
        int STANDARD = 0;
        int CODEFORCES = 2;
    }

    interface ContestStatus {
        int NOT_STARTED = 0;
        int RUNNING = 1;
        int ENDED = 2;
    }

    interface RedisKey {
        String SUBMIT_QUEUE = "oj:submit:queue";
        String RESULT_TOPIC = "oj:result:topic";
        String RANKLIST = "oj:ranklist";
        String CONTEST_RANKLIST_PREFIX = "oj:contest:ranklist:";
        String USER_PREFIX = "oj:user:";
        String SUBMISSION_PREFIX = "oj:submission:";
    }

    interface Language {
        String C = "C";
        String CPP = "C++";
        String JAVA = "Java";
        String PYTHON = "Python";

        String[] SUPPORTED = {C, CPP, JAVA, PYTHON};
    }
}
