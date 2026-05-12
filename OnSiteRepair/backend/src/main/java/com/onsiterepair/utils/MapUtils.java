package com.onsiterepair.utils;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class MapUtils {

    private static final double EARTH_RADIUS = 6371.0;

    public BigDecimal calculateDistance(BigDecimal lat1, BigDecimal lng1, BigDecimal lat2, BigDecimal lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
            return null;
        }

        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLng = Math.toRadians(lng2.doubleValue() - lng1.doubleValue());

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1.doubleValue())) *
                   Math.cos(Math.toRadians(lat2.doubleValue())) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        double distance = EARTH_RADIUS * c;
        
        return BigDecimal.valueOf(distance).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    public String formatDistance(BigDecimal distance) {
        if (distance == null) {
            return "";
        }
        if (distance.doubleValue() < 1) {
            return distance.multiply(BigDecimal.valueOf(1000)).intValue() + "米";
        }
        return distance.setScale(1, BigDecimal.ROUND_HALF_UP).toString() + "公里";
    }
}
