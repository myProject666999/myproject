package com.db.schema.review.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.db.schema.review.entity.RiskDetection;
import com.db.schema.review.entity.SchemaOrder;
import com.db.schema.review.entity.SchemaOrderSql;
import com.db.schema.review.mapper.RiskDetectionMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class RiskDetectionService {

    @Autowired
    private RiskDetectionMapper riskDetectionMapper;

    public List<RiskDetection> detectRisk(SchemaOrder order, List<SchemaOrderSql> sqlList) {
        List<RiskDetection> allRisks = new ArrayList<>();
        riskDetectionMapper.delete(new LambdaQueryWrapper<RiskDetection>().eq(RiskDetection::getOrderId, order.getId()));

        for (SchemaOrderSql sqlItem : sqlList) {
            List<RiskDetection> sqlRisks = analyzeSqlRisk(order, sqlItem);
            allRisks.addAll(sqlRisks);
        }

        String overallRisk = calculateOverallRisk(allRisks);
        order.setRiskLevel(overallRisk);

        return allRisks;
    }

    private List<RiskDetection> analyzeSqlRisk(SchemaOrder order, SchemaOrderSql sqlItem) {
        List<RiskDetection> risks = new ArrayList<>();
        String sql = sqlItem.getSqlContent().toUpperCase().trim();

        checkDropTableRisk(order, sqlItem, sql, risks);
        checkRenameTableRisk(order, sqlItem, sql, risks);
        checkMissingWhereRisk(order, sqlItem, sql, risks);
        checkAlterLargeTableRisk(order, sqlItem, sql, risks);
        checkLimitMissingRisk(order, sqlItem, sql, risks);
        checkSelectForUpdateRisk(order, sqlItem, sql, risks);
        checkTruncateRisk(order, sqlItem, sql, risks);

        for (RiskDetection risk : risks) {
            risk.setOrderId(order.getId());
            risk.setSqlId(sqlItem.getId());
            risk.setTableName(sqlItem.getTableName());
            risk.setDetectedTime(LocalDateTime.now());
            risk.setIsFixed(0);
            riskDetectionMapper.insert(risk);
        }

        return risks;
    }

    private void checkDropTableRisk(SchemaOrder order, SchemaOrderSql sqlItem, String sql, List<RiskDetection> risks) {
        if (sql.matches("(?s).*DROP\\s+TABLE.*")) {
            RiskDetection risk = new RiskDetection();
            risk.setRiskType("drop_table");
            risk.setRiskLevel("critical");
            risk.setRiskTitle("删除表操作检测");
            risk.setRiskDetail("检测到DROP TABLE操作，此操作将永久删除表及其所有数据。");
            risk.setSuggestion("建议先执行RENAME TABLE备份原表，确认无问题后再删除；或在业务低峰期执行。");
            risk.setSqlSnippet(extractSnippet(sqlItem.getSqlContent(), 100));
            risks.add(risk);
        }
    }

    private void checkRenameTableRisk(SchemaOrder order, SchemaOrderSql sqlItem, String sql, List<RiskDetection> risks) {
        if (sql.matches("(?s).*RENAME\\s+TABLE.*") || sql.matches("(?s).*ALTER\\s+TABLE.*RENAME.*")) {
            RiskDetection risk = new RiskDetection();
            risk.setRiskType("rename_table");
            risk.setRiskLevel("high");
            risk.setRiskTitle("重命名表操作检测");
            risk.setRiskDetail("检测到表重命名操作，可能导致应用程序连接失败。");
            risk.setSuggestion("请确保应用程序已更新配置，并准备好回滚方案。");
            risk.setSqlSnippet(extractSnippet(sqlItem.getSqlContent(), 100));
            risks.add(risk);
        }
    }

    private void checkMissingWhereRisk(SchemaOrder order, SchemaOrderSql sqlItem, String sql, List<RiskDetection> risks) {
        if ((sql.matches("(?s)UPDATE\\s+.*") || sql.matches("(?s)DELETE\\s+FROM\\s+.*"))
                && !sql.matches("(?s).*\\bWHERE\\b.*")) {
            RiskDetection risk = new RiskDetection();
            risk.setRiskType("missing_where");
            risk.setRiskLevel("critical");
            risk.setRiskTitle("缺少WHERE条件的DML操作");
            risk.setRiskDetail("检测到UPDATE/DELETE语句缺少WHERE条件，这将影响表中所有行！");
            risk.setSuggestion("必须添加WHERE条件限定操作范围。如需全表操作，请特别说明并获得DBA审批。");
            risk.setSqlSnippet(extractSnippet(sqlItem.getSqlContent(), 100));
            risks.add(risk);
        }
    }

    private void checkAlterLargeTableRisk(SchemaOrder order, SchemaOrderSql sqlItem, String sql, List<RiskDetection> risks) {
        if (sql.matches("(?s).*ALTER\\s+TABLE.*") && sqlItem.getEstimatedRows() != null && sqlItem.getEstimatedRows() > 100000) {
            RiskDetection risk = new RiskDetection();
            risk.setRiskType("large_table_alter");
            risk.setRiskLevel("high");
            risk.setRiskTitle("大表ALTER操作检测");
            risk.setRiskDetail(String.format("检测到对大表执行ALTER操作，预估数据量：%d行。大表DDL可能导致长时间锁表。", sqlItem.getEstimatedRows()));
            risk.setSuggestion("建议使用gh-ost/pt-online-schema-change等在线DDL工具；或在业务低峰期执行；设置合理的lock_wait_timeout。");
            risk.setSqlSnippet(extractSnippet(sqlItem.getSqlContent(), 100));
            risks.add(risk);
        }
    }

    private void checkLimitMissingRisk(SchemaOrder order, SchemaOrderSql sqlItem, String sql, List<RiskDetection> risks) {
        if ((sql.matches("(?s)UPDATE\\s+.*") || sql.matches("(?s)DELETE\\s+FROM\\s+.*"))
                && !sql.matches("(?s).*\\bLIMIT\\b.*")
                && sqlItem.getEstimatedRows() != null && sqlItem.getEstimatedRows() > 10000) {
            RiskDetection risk = new RiskDetection();
            risk.setRiskType("limit_missing");
            risk.setRiskLevel("medium");
            risk.setRiskTitle("批量操作缺少LIMIT");
            risk.setRiskDetail(String.format("批量操作预估影响%d行，但未使用LIMIT分批。", sqlItem.getEstimatedRows()));
            risk.setSuggestion("建议添加LIMIT子句分批执行，减少长事务和锁等待。");
            risk.setSqlSnippet(extractSnippet(sqlItem.getSqlContent(), 100));
            risks.add(risk);
        }
    }

    private void checkSelectForUpdateRisk(SchemaOrder order, SchemaOrderSql sqlItem, String sql, List<RiskDetection> risks) {
        if (sql.matches("(?s).*SELECT.*FOR\\s+UPDATE.*")) {
            RiskDetection risk = new RiskDetection();
            risk.setRiskType("select_for_update");
            risk.setRiskLevel("medium");
            risk.setRiskTitle("SELECT加锁操作检测");
            risk.setRiskDetail("检测到SELECT ... FOR UPDATE操作，可能导致行锁等待。");
            risk.setSuggestion("确保事务尽快提交，避免长事务；注意死锁风险。");
            risk.setSqlSnippet(extractSnippet(sqlItem.getSqlContent(), 100));
            risks.add(risk);
        }
    }

    private void checkTruncateRisk(SchemaOrder order, SchemaOrderSql sqlItem, String sql, List<RiskDetection> risks) {
        if (sql.matches("(?s).*TRUNCATE\\s+TABLE.*")) {
            RiskDetection risk = new RiskDetection();
            risk.setRiskType("truncate_table");
            risk.setRiskLevel("critical");
            risk.setRiskTitle("清空表操作检测");
            risk.setRiskDetail("检测到TRUNCATE TABLE操作，这将快速清空表中所有数据且无法回滚！");
            risk.setSuggestion("执行前请务必确认数据已备份；建议先RENAME备份再执行TRUNCATE。");
            risk.setSqlSnippet(extractSnippet(sqlItem.getSqlContent(), 100));
            risks.add(risk);
        }
    }

    private String calculateOverallRisk(List<RiskDetection> risks) {
        if (risks.isEmpty()) {
            return "low";
        }
        boolean hasCritical = risks.stream().anyMatch(r -> "critical".equals(r.getRiskLevel()));
        boolean hasHigh = risks.stream().anyMatch(r -> "high".equals(r.getRiskLevel()));
        boolean hasMedium = risks.stream().anyMatch(r -> "medium".equals(r.getRiskLevel()));

        if (hasCritical) return "critical";
        if (hasHigh) return "high";
        if (hasMedium) return "medium";
        return "low";
    }

    private String extractSnippet(String content, int maxLength) {
        if (content == null) return "";
        content = content.trim().replaceAll("\\s+", " ");
        return content.length() > maxLength ? content.substring(0, maxLength) + "..." : content;
    }

    public String extractTableName(String sql) {
        sql = sql.toUpperCase().trim();
        Pattern pattern;
        Matcher matcher;

        String[] patterns = {
                "FROM\\s+(\\w+)",
                "UPDATE\\s+(\\w+)",
                "INTO\\s+(\\w+)",
                "TABLE\\s+(\\w+)",
                "JOIN\\s+(\\w+)"
        };

        for (String p : patterns) {
            pattern = Pattern.compile(p);
            matcher = pattern.matcher(sql);
            if (matcher.find()) {
                return matcher.group(1).toLowerCase();
            }
        }
        return null;
    }

    public String determineSqlType(String sql) {
        sql = sql.toUpperCase().trim();
        if (sql.startsWith("CREATE")) return "CREATE";
        if (sql.startsWith("ALTER")) return "ALTER";
        if (sql.startsWith("DROP")) return "DROP";
        if (sql.startsWith("RENAME")) return "RENAME";
        if (sql.startsWith("TRUNCATE")) return "TRUNCATE";
        if (sql.startsWith("INSERT")) return "INSERT";
        if (sql.startsWith("UPDATE")) return "UPDATE";
        if (sql.startsWith("DELETE")) return "DELETE";
        if (sql.startsWith("SELECT")) return "SELECT";
        return "OTHER";
    }

    public List<RiskDetection> getRisksByOrderId(Long orderId) {
        return riskDetectionMapper.selectList(
                new LambdaQueryWrapper<RiskDetection>()
                        .eq(RiskDetection::getOrderId, orderId)
                        .orderByDesc(RiskDetection::getRiskLevel)
        );
    }
}
