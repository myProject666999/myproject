package com.tcm.system.util;

import com.tcm.system.dto.ConflictCheckResult;

import java.util.*;

public class ConflictCheckUtil {

    private static final Map<String, Set<String>> EIGHTEEN_INCOMPATIBLES = new HashMap<>();
    private static final Map<String, Set<String>> NINETEEN_MUTUAL_FEAR = new HashMap<>();

    static {
        EIGHTEEN_INCOMPATIBLES.put("甘草", new HashSet<>(Arrays.asList("甘遂", "大戟", "海藻", "芫花")));
        EIGHTEEN_INCOMPATIBLES.put("甘遂", new HashSet<>(Arrays.asList("甘草")));
        EIGHTEEN_INCOMPATIBLES.put("大戟", new HashSet<>(Arrays.asList("甘草")));
        EIGHTEEN_INCOMPATIBLES.put("海藻", new HashSet<>(Arrays.asList("甘草")));
        EIGHTEEN_INCOMPATIBLES.put("芫花", new HashSet<>(Arrays.asList("甘草")));

        EIGHTEEN_INCOMPATIBLES.put("乌头", new HashSet<>(Arrays.asList("贝母", "瓜蒌", "半夏", "白蔹", "白及")));
        EIGHTEEN_INCOMPATIBLES.put("贝母", new HashSet<>(Arrays.asList("乌头")));
        EIGHTEEN_INCOMPATIBLES.put("瓜蒌", new HashSet<>(Arrays.asList("乌头")));
        EIGHTEEN_INCOMPATIBLES.put("半夏", new HashSet<>(Arrays.asList("乌头")));
        EIGHTEEN_INCOMPATIBLES.put("白蔹", new HashSet<>(Arrays.asList("乌头")));
        EIGHTEEN_INCOMPATIBLES.put("白及", new HashSet<>(Arrays.asList("乌头")));

        EIGHTEEN_INCOMPATIBLES.put("藜芦", new HashSet<>(Arrays.asList("人参", "沙参", "丹参", "玄参", "苦参", "细辛", "芍药")));
        EIGHTEEN_INCOMPATIBLES.put("人参", new HashSet<>(Arrays.asList("藜芦")));
        EIGHTEEN_INCOMPATIBLES.put("沙参", new HashSet<>(Arrays.asList("藜芦")));
        EIGHTEEN_INCOMPATIBLES.put("丹参", new HashSet<>(Arrays.asList("藜芦")));
        EIGHTEEN_INCOMPATIBLES.put("玄参", new HashSet<>(Arrays.asList("藜芦")));
        EIGHTEEN_INCOMPATIBLES.put("苦参", new HashSet<>(Arrays.asList("藜芦")));
        EIGHTEEN_INCOMPATIBLES.put("细辛", new HashSet<>(Arrays.asList("藜芦")));
        EIGHTEEN_INCOMPATIBLES.put("芍药", new HashSet<>(Arrays.asList("藜芦")));

        NINETEEN_MUTUAL_FEAR.put("硫黄", new HashSet<>(Arrays.asList("朴硝")));
        NINETEEN_MUTUAL_FEAR.put("朴硝", new HashSet<>(Arrays.asList("硫黄")));
        NINETEEN_MUTUAL_FEAR.put("水银", new HashSet<>(Arrays.asList("砒霜")));
        NINETEEN_MUTUAL_FEAR.put("砒霜", new HashSet<>(Arrays.asList("水银")));
        NINETEEN_MUTUAL_FEAR.put("狼毒", new HashSet<>(Arrays.asList("密陀僧")));
        NINETEEN_MUTUAL_FEAR.put("密陀僧", new HashSet<>(Arrays.asList("狼毒")));
        NINETEEN_MUTUAL_FEAR.put("巴豆", new HashSet<>(Arrays.asList("牵牛子")));
        NINETEEN_MUTUAL_FEAR.put("牵牛子", new HashSet<>(Arrays.asList("巴豆")));
        NINETEEN_MUTUAL_FEAR.put("丁香", new HashSet<>(Arrays.asList("郁金")));
        NINETEEN_MUTUAL_FEAR.put("郁金", new HashSet<>(Arrays.asList("丁香")));
        NINETEEN_MUTUAL_FEAR.put("牙硝", new HashSet<>(Arrays.asList("三棱")));
        NINETEEN_MUTUAL_FEAR.put("三棱", new HashSet<>(Arrays.asList("牙硝")));
        NINETEEN_MUTUAL_FEAR.put("川乌", new HashSet<>(Arrays.asList("犀角")));
        NINETEEN_MUTUAL_FEAR.put("草乌", new HashSet<>(Arrays.asList("犀角")));
        NINETEEN_MUTUAL_FEAR.put("犀角", new HashSet<>(Arrays.asList("川乌", "草乌")));
        NINETEEN_MUTUAL_FEAR.put("官桂", new HashSet<>(Arrays.asList("石脂")));
        NINETEEN_MUTUAL_FEAR.put("石脂", new HashSet<>(Arrays.asList("官桂")));
        NINETEEN_MUTUAL_FEAR.put("人参", new HashSet<>(Arrays.asList("五灵脂")));
        NINETEEN_MUTUAL_FEAR.put("五灵脂", new HashSet<>(Arrays.asList("人参")));
    }

    public static ConflictCheckResult checkConflicts(List<String> herbNames) {
        ConflictCheckResult result = new ConflictCheckResult();
        List<ConflictCheckResult.ConflictInfo> conflicts = new ArrayList<>();

        if (herbNames == null || herbNames.size() < 2) {
            result.setHasConflict(false);
            result.setConflicts(conflicts);
            return result;
        }

        Set<String> herbSet = new HashSet<>(herbNames);
        Set<String> checked = new HashSet<>();

        for (String herbA : herbSet) {
            if (checked.contains(herbA)) continue;

            Set<String> incompatible = EIGHTEEN_INCOMPATIBLES.get(herbA);
            if (incompatible != null) {
                for (String herbB : incompatible) {
                    if (herbSet.contains(herbB) && !checked.contains(herbB)) {
                        ConflictCheckResult.ConflictInfo info = new ConflictCheckResult.ConflictInfo();
                        info.setHerbAName(herbA);
                        info.setHerbBName(herbB);
                        info.setConflictType(1);
                        info.setConflictTypeName("十八反");
                        info.setDescription(herbA + "与" + herbB + "相反，不能同用");
                        conflicts.add(info);
                    }
                }
            }

            Set<String> fear = NINETEEN_MUTUAL_FEAR.get(herbA);
            if (fear != null) {
                for (String herbB : fear) {
                    if (herbSet.contains(herbB) && !checked.contains(herbB)) {
                        ConflictCheckResult.ConflictInfo info = new ConflictCheckResult.ConflictInfo();
                        info.setHerbAName(herbA);
                        info.setHerbBName(herbB);
                        info.setConflictType(2);
                        info.setConflictTypeName("十九畏");
                        info.setDescription(herbA + "与" + herbB + "相畏，不宜同用");
                        conflicts.add(info);
                    }
                }
            }
            checked.add(herbA);
        }

        result.setHasConflict(!conflicts.isEmpty());
        result.setConflicts(conflicts);
        return result;
    }
}
