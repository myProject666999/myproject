package com.recruitment.util;

public class RedisKeyUtil {

    private static final String PREFIX = "recruitment:";

    public static final String HOT_JOBS = PREFIX + "hot:jobs";
    public static final String JOB_VIEW_COUNT = PREFIX + "job:view:";
    public static final String USER_TOKEN = PREFIX + "user:token:";

    private RedisKeyUtil() {
    }

    public static String getHotJobsKey() {
        return HOT_JOBS;
    }

    public static String getJobViewCountKey(Long jobId) {
        return JOB_VIEW_COUNT + jobId;
    }

    public static String getUserTokenKey(Long userId) {
        return USER_TOKEN + userId;
    }
}
