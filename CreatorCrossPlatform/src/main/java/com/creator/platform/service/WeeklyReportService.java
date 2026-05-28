package com.creator.platform.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.creator.platform.cache.RedisCacheService;
import com.creator.platform.entity.*;
import com.creator.platform.enums.PlatformCodeEnum;
import com.creator.platform.enums.ReportTypeEnum;
import com.creator.platform.mapper.*;
import com.creator.platform.vo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeeklyReportService {

    private final RedisCacheService redisCacheService;
    private final WeeklyReportMapper weeklyReportMapper;
    private final AccountDailyMetricsMapper accountDailyMetricsMapper;
    private final ContentMapper contentMapper;
    private final ContentMetricsMapper contentMetricsMapper;
    private final CreatorAccountMapper creatorAccountMapper;
    private final PlatformMapper platformMapper;
    private final ContentRankService contentRankService;

    private static final String REPORT_CACHE_KEY = "weekly:report:";
    private static final int CACHE_MINUTES = 120;

    public WeeklyReportVO getWeeklyReport(Long creatorId, String reportType, LocalDate weekDate) {
        LocalDate weekStart = getWeekStartDate(weekDate);
        LocalDate weekEnd = weekStart.plusDays(6);

        String cacheKey = REPORT_CACHE_KEY + creatorId + ":" + reportType + ":" + weekStart;
        WeeklyReportVO cached = redisCacheService.get(cacheKey, WeeklyReportVO.class);
        if (cached != null) {
            return cached;
        }

        WeeklyReport report = weeklyReportMapper.selectOne(
                new LambdaQueryWrapper<WeeklyReport>()
                        .eq(WeeklyReport::getCreatorId, creatorId)
                        .eq(WeeklyReport::getReportType, reportType)
                        .eq(WeeklyReport::getWeekStartDate, weekStart)
                        .eq(WeeklyReport::getWeekEndDate, weekEnd)
        );

        WeeklyReportVO vo;
        if (report != null) {
            vo = convertToVO(report, creatorId, reportType, weekStart, weekEnd);
        } else {
            vo = generateWeeklyReport(creatorId, reportType, weekStart, weekEnd);
        }

        redisCacheService.set(cacheKey, vo, CACHE_MINUTES, TimeUnit.MINUTES);
        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    public WeeklyReportVO generateWeeklyReport(Long creatorId, String reportType, LocalDate weekStart, LocalDate weekEnd) {
        log.info("开始生成周报, creatorId: {}, reportType: {}, week: {} - {}", creatorId, reportType, weekStart, weekEnd);

        List<CreatorAccount> accounts = getAccountsForReport(creatorId, reportType);
        if (accounts.isEmpty()) {
            return createEmptyReportVO(creatorId, reportType, weekStart, weekEnd);
        }

        List<Long> accountIds = accounts.stream().map(CreatorAccount::getId).toList();
        Map<Long, Platform> platformMap = platformMapper.selectList(null).stream()
                .collect(Collectors.toMap(Platform::getId, p -> p));

        List<AccountDailyMetrics> weekMetrics = accountDailyMetricsMapper.selectList(
                new LambdaQueryWrapper<AccountDailyMetrics>()
                        .in(AccountDailyMetrics::getAccountId, accountIds)
                        .between(AccountDailyMetrics::getStatDate, weekStart, weekEnd)
        );

        LocalDate previousWeekStart = weekStart.minusWeeks(1);
        LocalDate previousWeekEnd = weekStart.minusDays(1);
        List<AccountDailyMetrics> previousWeekMetrics = accountDailyMetricsMapper.selectList(
                new LambdaQueryWrapper<AccountDailyMetrics>()
                        .in(AccountDailyMetrics::getAccountId, accountIds)
                        .between(AccountDailyMetrics::getStatDate, previousWeekStart, previousWeekEnd)
        );

        WeeklyReport report = new WeeklyReport();
        report.setCreatorId(creatorId);
        report.setReportType(reportType);
        report.setWeekStartDate(weekStart);
        report.setWeekEndDate(weekEnd);
        report.setWeekNum(weekStart.get(WeekFields.of(DayOfWeek.MONDAY, 1).weekOfWeekBasedYear()));

        report.setTotalFans(sumLatestFans(weekMetrics, accounts));
        report.setWeeklyNewFans((int) sumField(weekMetrics, AccountDailyMetrics::getNewFans));
        report.setWeeklyLostFans((int) sumField(weekMetrics, AccountDailyMetrics::getLostFans));
        report.setWeeklyNetFans(report.getWeeklyNewFans() - report.getWeeklyLostFans());

        report.setWeeklyViews(sumField(weekMetrics, AccountDailyMetrics::getDailyViews));
        report.setWeeklyLikes((int) sumField(weekMetrics, AccountDailyMetrics::getDailyLikes));
        report.setWeeklyComments((int) sumField(weekMetrics, AccountDailyMetrics::getDailyComments));
        report.setWeeklyShares((int) sumField(weekMetrics, AccountDailyMetrics::getDailyShares));
        report.setWeeklyCollects((int) sumField(weekMetrics, AccountDailyMetrics::getDailyCollects));
        report.setWeeklyEngagementRate(calculateAvgEngagementRate(weekMetrics));

        ContentRankVO topContent = findTopContent(creatorId, accountIds, weekStart, weekEnd);
        if (topContent != null) {
            report.setTopContentId(topContent.getContentId());
            report.setTopContentViews(topContent.getTotalViews());
        }

        long previousWeekFans = sumLatestFans(previousWeekMetrics, accounts);
        long previousWeekViews = sumField(previousWeekMetrics, AccountDailyMetrics::getDailyViews);
        report.setFansGrowthRate(calculateGrowthRate(report.getTotalFans() - previousWeekFans, previousWeekFans));
        report.setViewsGrowthRate(calculateGrowthRate(report.getWeeklyViews() - previousWeekViews, previousWeekViews));

        report.setSummary(generateSummary(report, previousWeekFans, previousWeekViews));
        report.setSuggestions(generateSuggestions(report, accounts, platformMap));

        saveOrUpdateReport(report);

        WeeklyReportVO vo = convertToVO(report, creatorId, reportType, weekStart, weekEnd);
        vo.setPlatformMetrics(generatePlatformMetrics(creatorId, weekStart, weekEnd, platformMap));
        vo.setDailyTrend(generateDailyTrend(creatorId, accountIds, weekStart, weekEnd));
        vo.setTopContents(contentRankService.getTopContents(creatorId, null, 10, "views"));

        if (topContent != null) {
            vo.setTopContentTitle(topContent.getContentTitle());
            vo.setTopContentEngagementRate(topContent.getEngagementRate());
        }

        return vo;
    }

    private List<CreatorAccount> getAccountsForReport(Long creatorId, String reportType) {
        LambdaQueryWrapper<CreatorAccount> query = new LambdaQueryWrapper<CreatorAccount>()
                .eq(CreatorAccount::getCreatorId, creatorId)
                .eq(CreatorAccount::getStatus, 1);

        if (!ReportTypeEnum.ALL.getCode().equals(reportType)) {
            Platform platform = platformMapper.selectOne(
                    new LambdaQueryWrapper<Platform>().eq(Platform::getPlatformCode, reportType)
            );
            if (platform != null) {
                query.eq(CreatorAccount::getPlatformId, platform.getId());
            }
        }

        return creatorAccountMapper.selectList(query);
    }

    private long sumLatestFans(List<AccountDailyMetrics> metrics, List<CreatorAccount> accounts) {
        long total = 0;
        for (CreatorAccount account : accounts) {
            Optional<AccountDailyMetrics> latest = metrics.stream()
                    .filter(m -> m.getAccountId().equals(account.getId()))
                    .max(Comparator.comparing(AccountDailyMetrics::getStatDate));
            total += latest.map(AccountDailyMetrics::getTotalFans).orElse(0L);
        }
        return total;
    }

    private long sumField(List<AccountDailyMetrics> metrics, java.util.function.ToIntFunction<AccountDailyMetrics> function) {
        return metrics.stream().mapToLong(function::applyAsInt).sum();
    }

    private BigDecimal calculateAvgEngagementRate(List<AccountDailyMetrics> metrics) {
        if (metrics.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal sum = metrics.stream()
                .map(m -> m.getEngagementRate() != null ? m.getEngagementRate() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(metrics.size()), 4, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateGrowthRate(long change, long base) {
        if (base == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(change)
                .divide(BigDecimal.valueOf(base), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private ContentRankVO findTopContent(Long creatorId, List<Long> accountIds, LocalDate weekStart, LocalDate weekEnd) {
        List<Content> contents = contentMapper.selectList(
                new LambdaQueryWrapper<Content>()
                        .in(Content::getAccountId, accountIds)
                        .eq(Content::getStatus, 1)
                        .between(Content::getPublishTime, weekStart.atStartOfDay(), weekEnd.atTime(23, 59, 59))
        );

        if (contents.isEmpty()) {
            return null;
        }

        List<Long> contentIds = contents.stream().map(Content::getId).toList();
        Map<Long, ContentMetrics> metricsMap = contentMetricsMapper.selectList(
                new LambdaQueryWrapper<ContentMetrics>().in(ContentMetrics::getContentId, contentIds)
        ).stream().collect(Collectors.toMap(ContentMetrics::getContentId, m -> m));

        return contents.stream()
                .map(content -> {
                    ContentMetrics metrics = metricsMap.get(content.getId());
                    ContentRankVO vo = new ContentRankVO();
                    vo.setContentId(content.getId());
                    vo.setContentTitle(content.getContentTitle());
                    if (metrics != null) {
                        vo.setTotalViews(metrics.getTotalViews());
                        vo.setEngagementRate(metrics.getEngagementRate());
                    }
                    return vo;
                })
                .max(Comparator.comparing(v -> v.getTotalViews() != null ? v.getTotalViews() : 0L))
                .orElse(null);
    }

    private String generateSummary(WeeklyReport report, long previousFans, long previousViews) {
        StringBuilder sb = new StringBuilder();
        sb.append("本周总粉丝数达到").append(report.getTotalFans()).append("人，");
        sb.append("新增粉丝").append(report.getWeeklyNewFans()).append("人，");
        sb.append("流失粉丝").append(report.getWeeklyLostFans()).append("人，");
        sb.append("净增粉丝").append(report.getWeeklyNetFans()).append("人。");
        sb.append("本周总播放量").append(report.getWeeklyViews()).append("次，");
        sb.append("获得点赞").append(report.getWeeklyLikes()).append("次，");
        sb.append("评论").append(report.getWeeklyComments()).append("条，");
        sb.append("分享").append(report.getWeeklyShares()).append("次，");
        sb.append("收藏").append(report.getWeeklyCollects()).append("次。");
        sb.append("平均互动率为").append(report.getWeeklyEngagementRate().multiply(BigDecimal.valueOf(100))).append("%。");
        return sb.toString();
    }

    private String generateSuggestions(WeeklyReport report, List<CreatorAccount> accounts, Map<Long, Platform> platformMap) {
        List<String> suggestions = new ArrayList<>();

        if (report.getWeeklyNetFans() < 0) {
            suggestions.add("本周粉丝净流失，建议分析内容质量和发布频率，增加与粉丝的互动。");
        }

        if (report.getWeeklyEngagementRate().compareTo(new BigDecimal("0.03")) < 0) {
            suggestions.add("互动率偏低，建议在内容中增加互动元素，如提问、投票等。");
        }

        if (report.getViewsGrowthRate().compareTo(BigDecimal.ZERO) < 0) {
            suggestions.add("播放量出现下滑，建议关注热点话题，优化内容标题和封面。");
        }

        for (CreatorAccount account : accounts) {
            Platform platform = platformMap.get(account.getPlatformId());
            if (platform != null) {
                suggestions.add(platform.getPlatformName() + "平台建议保持稳定的发布频率，每周至少发布3-5条内容。");
            }
        }

        if (suggestions.isEmpty()) {
            suggestions.add("本周数据表现良好，建议继续保持当前的内容策略和发布节奏。");
        }

        return String.join(" ", suggestions);
    }

    private void saveOrUpdateReport(WeeklyReport report) {
        WeeklyReport existing = weeklyReportMapper.selectOne(
                new LambdaQueryWrapper<WeeklyReport>()
                        .eq(WeeklyReport::getCreatorId, report.getCreatorId())
                        .eq(WeeklyReport::getReportType, report.getReportType())
                        .eq(WeeklyReport::getWeekStartDate, report.getWeekStartDate())
                        .eq(WeeklyReport::getWeekEndDate, report.getWeekEndDate())
        );

        if (existing == null) {
            weeklyReportMapper.insert(report);
        } else {
            report.setId(existing.getId());
            weeklyReportMapper.updateById(report);
        }
    }

    private WeeklyReportVO convertToVO(WeeklyReport report, Long creatorId, String reportType, LocalDate weekStart, LocalDate weekEnd) {
        WeeklyReportVO vo = new WeeklyReportVO();
        vo.setReportId(report.getId());
        vo.setCreatorId(creatorId);
        vo.setReportType(reportType);
        vo.setReportTypeName(ReportTypeEnum.valueOf(reportType).getName());
        vo.setWeekStartDate(weekStart);
        vo.setWeekEndDate(weekEnd);
        vo.setWeekNum(report.getWeekNum());
        vo.setTotalFans(report.getTotalFans());
        vo.setWeeklyNewFans(report.getWeeklyNewFans());
        vo.setWeeklyLostFans(report.getWeeklyLostFans());
        vo.setWeeklyNetFans(report.getWeeklyNetFans());
        vo.setWeeklyViews(report.getWeeklyViews());
        vo.setWeeklyLikes(report.getWeeklyLikes());
        vo.setWeeklyComments(report.getWeeklyComments());
        vo.setWeeklyShares(report.getWeeklyShares());
        vo.setWeeklyCollects(report.getWeeklyCollects());
        vo.setWeeklyEngagementRate(report.getWeeklyEngagementRate());
        vo.setTopContentId(report.getTopContentId());
        vo.setTopContentViews(report.getTopContentViews());
        vo.setFansGrowthRate(report.getFansGrowthRate());
        vo.setViewsGrowthRate(report.getViewsGrowthRate());
        vo.setSummary(report.getSummary());
        vo.setSuggestions(report.getSuggestions());
        return vo;
    }

    private WeeklyReportVO createEmptyReportVO(Long creatorId, String reportType, LocalDate weekStart, LocalDate weekEnd) {
        WeeklyReportVO vo = new WeeklyReportVO();
        vo.setCreatorId(creatorId);
        vo.setReportType(reportType);
        vo.setReportTypeName(ReportTypeEnum.valueOf(reportType).getName());
        vo.setWeekStartDate(weekStart);
        vo.setWeekEndDate(weekEnd);
        vo.setWeekNum(weekStart.get(WeekFields.of(DayOfWeek.MONDAY, 1).weekOfWeekBasedYear()));
        vo.setTotalFans(0L);
        vo.setWeeklyNewFans(0);
        vo.setWeeklyLostFans(0);
        vo.setWeeklyNetFans(0);
        vo.setWeeklyViews(0L);
        vo.setWeeklyLikes(0);
        vo.setWeeklyComments(0);
        vo.setWeeklyShares(0);
        vo.setWeeklyCollects(0);
        vo.setWeeklyEngagementRate(BigDecimal.ZERO);
        vo.setFansGrowthRate(BigDecimal.ZERO);
        vo.setViewsGrowthRate(BigDecimal.ZERO);
        vo.setSummary("暂无数据，请先绑定平台账号并同步数据。");
        vo.setSuggestions("建议先绑定抖音、B站、小红书等平台账号，开启数据同步。");
        vo.setPlatformMetrics(new ArrayList<>());
        vo.setDailyTrend(new ArrayList<>());
        vo.setTopContents(new ArrayList<>());
        return vo;
    }

    private List<PlatformWeeklyMetricsVO> generatePlatformMetrics(Long creatorId, LocalDate weekStart, LocalDate weekEnd, Map<Long, Platform> platformMap) {
        List<PlatformWeeklyMetricsVO> result = new ArrayList<>();

        List<CreatorAccount> accounts = creatorAccountMapper.selectList(
                new LambdaQueryWrapper<CreatorAccount>()
                        .eq(CreatorAccount::getCreatorId, creatorId)
                        .eq(CreatorAccount::getStatus, 1)
        );

        for (CreatorAccount account : accounts) {
            Platform platform = platformMap.get(account.getPlatformId());
            if (platform == null) continue;

            List<AccountDailyMetrics> metrics = accountDailyMetricsMapper.selectList(
                    new LambdaQueryWrapper<AccountDailyMetrics>()
                            .eq(AccountDailyMetrics::getAccountId, account.getId())
                            .between(AccountDailyMetrics::getStatDate, weekStart, weekEnd)
            );

            PlatformWeeklyMetricsVO vo = new PlatformWeeklyMetricsVO();
            vo.setPlatformId(platform.getId());
            vo.setPlatformCode(platform.getPlatformCode());
            vo.setPlatformName(platform.getPlatformName());

            long totalFans = metrics.stream()
                    .max(Comparator.comparing(AccountDailyMetrics::getStatDate))
                    .map(AccountDailyMetrics::getTotalFans)
                    .orElse(0L);
            vo.setTotalFans(totalFans);

            int newFans = metrics.stream().mapToInt(AccountDailyMetrics::getNewFans).sum();
            int lostFans = metrics.stream().mapToInt(AccountDailyMetrics::getLostFans).sum();
            vo.setWeeklyNewFans(newFans);
            vo.setWeeklyNetFans(newFans - lostFans);

            vo.setWeeklyViews((long) metrics.stream().mapToInt(AccountDailyMetrics::getDailyViews).sum());
            vo.setWeeklyLikes(metrics.stream().mapToInt(AccountDailyMetrics::getDailyLikes).sum());
            vo.setWeeklyComments(metrics.stream().mapToInt(AccountDailyMetrics::getDailyComments).sum());
            vo.setWeeklyShares(metrics.stream().mapToInt(AccountDailyMetrics::getDailyShares).sum());
            vo.setWeeklyCollects(metrics.stream().mapToInt(AccountDailyMetrics::getDailyCollects).sum());
            vo.setWeeklyEngagementRate(calculateAvgEngagementRate(metrics));

            result.add(vo);
        }

        return result;
    }

    private List<WeeklyTrendVO> generateDailyTrend(Long creatorId, List<Long> accountIds, LocalDate weekStart, LocalDate weekEnd) {
        List<WeeklyTrendVO> trend = new ArrayList<>();

        for (LocalDate date = weekStart; !date.isAfter(weekEnd); date = date.plusDays(1)) {
            LocalDate currentDate = date;
            List<AccountDailyMetrics> metrics = accountDailyMetricsMapper.selectList(
                    new LambdaQueryWrapper<AccountDailyMetrics>()
                            .in(AccountDailyMetrics::getAccountId, accountIds)
                            .eq(AccountDailyMetrics::getStatDate, currentDate)
            );

            long newFans = (long) metrics.stream().mapToInt(AccountDailyMetrics::getNewFans).sum();
            long views = (long) metrics.stream().mapToInt(AccountDailyMetrics::getDailyViews).sum();
            long interactions = (long) metrics.stream().mapToInt(m ->
                    m.getDailyLikes() + m.getDailyComments() + m.getDailyShares() + m.getDailyCollects()
            ).sum();

            trend.add(new WeeklyTrendVO(currentDate, newFans, views, interactions));
        }

        return trend;
    }

    private LocalDate getWeekStartDate(LocalDate date) {
        return date.with(DayOfWeek.MONDAY);
    }

    public List<WeeklyReportVO> getReportList(Long creatorId, int pageNum, int pageSize) {
        List<WeeklyReport> reports = weeklyReportMapper.selectList(
                new LambdaQueryWrapper<WeeklyReport>()
                        .eq(WeeklyReport::getCreatorId, creatorId)
                        .eq(WeeklyReport::getReportType, ReportTypeEnum.ALL.getCode())
                        .orderByDesc(WeeklyReport::getWeekStartDate)
                        .last("LIMIT " + (pageNum - 1) * pageSize + ", " + pageSize)
        );

        return reports.stream().map(r -> {
            WeeklyReportVO vo = new WeeklyReportVO();
            vo.setReportId(r.getId());
            vo.setCreatorId(r.getCreatorId());
            vo.setReportType(r.getReportType());
            vo.setReportTypeName(ReportTypeEnum.valueOf(r.getReportType()).getName());
            vo.setWeekStartDate(r.getWeekStartDate());
            vo.setWeekEndDate(r.getWeekEndDate());
            vo.setWeekNum(r.getWeekNum());
            vo.setTotalFans(r.getTotalFans());
            vo.setWeeklyNetFans(r.getWeeklyNetFans());
            vo.setWeeklyViews(r.getWeeklyViews());
            vo.setWeeklyEngagementRate(r.getWeeklyEngagementRate());
            vo.setFansGrowthRate(r.getFansGrowthRate());
            vo.setViewsGrowthRate(r.getViewsGrowthRate());
            return vo;
        }).toList();
    }

    public void evictCache(Long creatorId) {
        String pattern = REPORT_CACHE_KEY + creatorId + "*";
        var keys = redisCacheService.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisCacheService.deleteBatch(keys);
        }
    }
}
