package com.micro.frontend.util;

import java.util.regex.Pattern;

public class VersionUtil {

    private static final Pattern VERSION_PATTERN = Pattern.compile("^\\d+\\.\\d+\\.\\d+$");

    public static int compare(String v1, String v2) {
        if (v1 == null || v2 == null) {
            throw new IllegalArgumentException("Version cannot be null");
        }
        if (!isValidVersion(v1) || !isValidVersion(v2)) {
            throw new IllegalArgumentException("Invalid version format. Expected format: x.y.z");
        }

        String[] parts1 = v1.split("\\.");
        String[] parts2 = v2.split("\\.");

        for (int i = 0; i < 3; i++) {
            int p1 = Integer.parseInt(parts1[i]);
            int int2 = Integer.parseInt(parts2[i]);
            if (p1 != int2) {
                return Integer.compare(p1, int2);
            }
        }
        return 0;
    }

    public static boolean isGreater(String v1, String v2) {
        return compare(v1, v2) > 0;
    }

    public static boolean isLess(String v1, String v2) {
        return compare(v1, v2) < 0;
    }

    public static boolean isEqual(String v1, String v2) {
        return compare(v1, v2) == 0;
    }

    public static boolean isGreaterOrEqual(String v1, String v2) {
        return compare(v1, v2) >= 0;
    }

    public static boolean isLessOrEqual(String v1, String v2) {
        return compare(v1, v2) <= 0;
    }

    public static boolean isValidVersion(String version) {
        if (version == null) {
            return false;
        }
        return VERSION_PATTERN.matcher(version).matches();
    }

    public static boolean isCompatible(String version, String minVersion, String maxVersion) {
        if (version == null) {
            return false;
        }
        if (minVersion != null && isLess(version, minVersion)) {
            return false;
        }
        if (maxVersion != null && isGreater(version, maxVersion)) {
            return false;
        }
        return true;
    }

    public static String incrementMajor(String version) {
        if (!isValidVersion(version)) {
            throw new IllegalArgumentException("Invalid version format");
        }
        String[] parts = version.split("\\.");
        int major = Integer.parseInt(parts[0]) + 1;
        return major + ".0.0";
    }

    public static String incrementMinor(String version) {
        if (!isValidVersion(version)) {
            throw new IllegalArgumentException("Invalid version format");
        }
        String[] parts = version.split("\\.");
        int minor = Integer.parseInt(parts[1]) + 1;
        return parts[0] + "." + minor + ".0";
    }

    public static String incrementPatch(String version) {
        if (!isValidVersion(version)) {
            throw new IllegalArgumentException("Invalid version format");
        }
        String[] parts = version.split("\\.");
        int patch = Integer.parseInt(parts[2]) + 1;
        return parts[0] + "." + parts[1] + "." + patch;
    }
}
