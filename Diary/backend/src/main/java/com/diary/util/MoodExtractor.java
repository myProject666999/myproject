package com.diary.util;

import com.diary.entity.MoodTag;

import java.util.*;
import java.util.stream.Collectors;

public class MoodExtractor {

    private static final Map<String, MoodTag> keywordMap = new HashMap<>();

    static {
        addKeyword("开心", "积极", 8);
        addKeyword("快乐", "积极", 9);
        addKeyword("高兴", "积极", 8);
        addKeyword("兴奋", "积极", 9);
        addKeyword("激动", "积极", 9);
        addKeyword("满足", "积极", 7);
        addKeyword("幸福", "积极", 10);
        addKeyword("愉快", "积极", 8);
        addKeyword("感恩", "积极", 8);
        addKeyword("感谢", "积极", 7);
        addKeyword("期待", "积极", 7);
        addKeyword("希望", "积极", 7);
        addKeyword("喜欢", "积极", 8);
        addKeyword("爱", "积极", 10);
        addKeyword("棒", "积极", 8);
        addKeyword("好", "积极", 7);
        addKeyword("赞", "积极", 8);
        addKeyword("成功", "积极", 9);
        addKeyword("顺利", "积极", 7);

        addKeyword("平静", "中性", 5);
        addKeyword("放松", "中性", 6);
        addKeyword("一般", "中性", 5);
        addKeyword("普通", "中性", 5);
        addKeyword("还行", "中性", 5);
        addKeyword("无聊", "中性", 4);
        addKeyword("疲惫", "中性", 3);
        addKeyword("累", "中性", 3);
        addKeyword("困", "中性", 4);
        addKeyword("饿", "中性", 4);

        addKeyword("焦虑", "消极", 2);
        addKeyword("难过", "消极", 2);
        addKeyword("伤心", "消极", 1);
        addKeyword("悲伤", "消极", 1);
        addKeyword("愤怒", "消极", 1);
        addKeyword("生气", "消极", 1);
        addKeyword("沮丧", "消极", 1);
        addKeyword("失落", "消极", 2);
        addKeyword("压力", "消极", 2);
        addKeyword("失望", "消极", 2);
        addKeyword("绝望", "消极", 1);
        addKeyword("孤独", "消极", 2);
        addKeyword("寂寞", "消极", 2);
        addKeyword("担忧", "消极", 3);
        addKeyword("担心", "消极", 3);
        addKeyword("害怕", "消极", 2);
        addKeyword("恐惧", "消极", 1);
        addKeyword("后悔", "消极", 2);
        addKeyword("愧疚", "消极", 2);
        addKeyword("糟糕", "消极", 1);
        addKeyword("坏", "消极", 2);
        addKeyword("差", "消极", 2);
        addKeyword("失败", "消极", 1);
        addKeyword("痛苦", "消极", 1);
    }

    private static void addKeyword(String name, String category, int weight) {
        MoodTag tag = new MoodTag();
        tag.setName(name);
        tag.setCategory(category);
        tag.setWeight(weight);
        keywordMap.put(name, tag);
    }

    public static List<MoodTag> extractTags(String content) {
        if (content == null || content.isEmpty()) {
            return new ArrayList<>();
        }

        Set<MoodTag> foundTags = new LinkedHashSet<>();
        for (Map.Entry<String, MoodTag> entry : keywordMap.entrySet()) {
            if (content.contains(entry.getKey())) {
                foundTags.add(entry.getValue());
            }
        }

        return new ArrayList<>(foundTags);
    }

    public static int calculateMoodScore(List<MoodTag> tags, int userScore) {
        return userScore;
    }

    public static String generateMoodSummary(List<MoodTag> tags) {
        if (tags == null || tags.isEmpty()) {
            return "今日心情平静";
        }

        Map<String, Long> categoryCount = tags.stream()
                .collect(Collectors.groupingBy(MoodTag::getCategory, Collectors.counting()));

        String dominantCategory = categoryCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("中性");

        String tagNames = tags.stream()
                .limit(5)
                .map(MoodTag::getName)
                .collect(Collectors.joining("、"));

        String prefix;
        switch (dominantCategory) {
            case "积极":
                prefix = "今日心情不错，感受到";
                break;
            case "消极":
                prefix = "今日心情低落，感受到";
                break;
            default:
                prefix = "今日心情平稳，感受到";
        }

        return prefix + tagNames;
    }
}
