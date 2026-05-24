package com.workorder.constant;

public class TicketConstant {

    public static final Integer CATEGORY_NOT_FOUND = 3001;
    public static final Integer TICKET_NOT_FOUND = 1001;
    public static final Integer TICKET_STATUS_ERROR = 1002;
    public static final Integer USER_NOT_FOUND = 2001;

    public static final String TICKET_NO_PREFIX = "T";

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_ASSIGNED = "ASSIGNED";
    public static final String STATUS_PROCESSING = "PROCESSING";
    public static final String STATUS_RESOLVED = "RESOLVED";
    public static final String STATUS_CLOSED = "CLOSED";
    public static final String STATUS_REJECTED = "REJECTED";

    public static final String PRIORITY_LOW = "LOW";
    public static final String PRIORITY_MEDIUM = "MEDIUM";
    public static final String PRIORITY_HIGH = "HIGH";
    public static final String PRIORITY_URGENT = "URGENT";

    public static final String SLA_STATUS_NORMAL = "NORMAL";
    public static final String SLA_STATUS_WARNING = "WARNING";
    public static final String SLA_STATUS_OVERDUE = "OVERDUE";

    public static final String ACTION_CREATE = "CREATE";
    public static final String ACTION_ASSIGN = "ASSIGN";
    public static final String ACTION_UPDATE_STATUS = "UPDATE_STATUS";
    public static final String ACTION_REPLY = "REPLY";
    public static final String ACTION_CLOSE = "CLOSE";
    public static final String ACTION_REOPEN = "REOPEN";

    public static final String SLA_EVENT_WARNING = "SLA_WARNING";
    public static final String SLA_EVENT_OVERDUE = "SLA_OVERDUE";
    public static final String SLA_EVENT_RESOLVED = "SLA_RESOLVED";

    public static final String NOTIFICATION_TYPE_TICKET = "TICKET";
    public static final String NOTIFICATION_TYPE_SLA = "SLA";
    public static final String NOTIFICATION_TYPE_SYSTEM = "SYSTEM";

    public static final String ROLE_CUSTOMER = "CUSTOMER";
    public static final String ROLE_AGENT = "AGENT";
    public static final String ROLE_ADMIN = "ADMIN";

    public static final String USER_STATUS_ACTIVE = "ACTIVE";
    public static final String USER_STATUS_INACTIVE = "INACTIVE";

    public static final String CATEGORY_STATUS_ACTIVE = "ACTIVE";
}