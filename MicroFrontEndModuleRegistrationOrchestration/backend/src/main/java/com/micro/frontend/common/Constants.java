package com.micro.frontend.common;

public class Constants {

    public static final Integer SUCCESS = 200;
    public static final Integer ERROR = 500;
    public static final Integer UNAUTHORIZED = 401;
    public static final Integer FORBIDDEN = 403;
    public static final Integer NOT_FOUND = 404;

    public static final Integer SUCCESS_CODE = 200;
    public static final Integer FAIL_CODE = 500;
    public static final String SUCCESS_MESSAGE = "操作成功";
    public static final String FAIL_MESSAGE = "操作失败";

    public static final String REDIS_KEY_PREFIX = "micro_frontend:";
    public static final String REDIS_CONFIG_PREFIX = REDIS_KEY_PREFIX + "config:";
    public static final String REDIS_APP_PREFIX = REDIS_KEY_PREFIX + "app:";
    public static final String REDIS_ROUTE_PREFIX = REDIS_KEY_PREFIX + "route:";
    public static final String REDIS_GRAY_PREFIX = REDIS_KEY_PREFIX + "gray:";
    public static final String REDIS_HEALTH_PREFIX = REDIS_KEY_PREFIX + "health:";
    public static final String REDIS_CLIENT_PREFIX = REDIS_KEY_PREFIX + "client:";

    public static final Integer STATUS_DELETED = 1;
    public static final Integer STATUS_NORMAL = 1;
    public static final Integer STATUS_DISABLED = 0;
    public static final Integer STATUS_GRAY = 2;

    public static final String GRAY_TYPE_USER = "USER";
    public static final String GRAY_TYPE_PROPORTION = "PROPORTION";

    public static final Integer GRAY_STATUS_PENDING = 0;
    public static final Integer GRAY_STATUS_RUNNING = 1;
    public static final Integer GRAY_STATUS_PAUSED = 2;
    public static final Integer GRAY_STATUS_FULL = 3;
    public static final Integer GRAY_STATUS_ROLLBACK = 4;

    public static final Integer HEALTH_STATUS_ABNORMAL = 0;
    public static final Integer HEALTH_STATUS_NORMAL = 1;
    public static final Integer HEALTH_STATUS_UNKNOWN = 2;

    public static final String OPERATION_TYPE_CREATE = "CREATE";
    public static final String OPERATION_TYPE_UPDATE = "UPDATE";
    public static final String OPERATION_TYPE_DELETE = "DELETE";
    public static final String OPERATION_TYPE_PUBLISH = "PUBLISH";
    public static final String OPERATION_TYPE_ROLLBACK = "ROLLBACK";

    public static final String MODULE_APP = "APP";
    public static final String MODULE_ROUTE = "ROUTE";
    public static final String MODULE_CONFIG = "CONFIG";
    public static final String MODULE_GRAY = "GRAY";
    public static final String MODULE_HEALTH = "HEALTH";

    public static final String DEPENDENCY_TYPE_APP = "APP";
    public static final String DEPENDENCY_TYPE_LIB = "LIB";

    public static final String CLIENT_TYPE_BROWSER = "BROWSER";
    public static final String CLIENT_TYPE_MOBILE = "MOBILE";

    public static final String CONFIG_TYPE_STRING = "string";
    public static final String CONFIG_TYPE_JSON = "json";
    public static final String CONFIG_TYPE_NUMBER = "number";
    public static final String CONFIG_TYPE_BOOLEAN = "boolean";

    public static final String PUBLISH_TYPE_FULL = "full";
    public static final String PUBLISH_TYPE_INCREMENT = "increment";

    public static final Integer PUBLISH_STATUS_PENDING = 0;
    public static final Integer PUBLISH_STATUS_PUBLISHING = 1;
    public static final Integer PUBLISH_STATUS_SUCCESS = 2;
    public static final Integer PUBLISH_STATUS_FAILED = 3;

    public static final String WEBSOCKET_TOPIC_CONFIG = "/topic/config";
    public static final String WEBSOCKET_TOPIC_APP = "/topic/app";
    public static final String WEBSOCKET_TOPIC_HEALTH = "/topic/health";
}
