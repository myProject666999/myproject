package com.port.container.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.port.container.entity.*;
import com.port.container.mapper.*;
import com.port.container.service.*;
import com.port.container.vo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StatisticsServiceImpl extends ServiceImpl<StatisticsRecordMapper, StatisticsRecord> implements StatisticsService {

    @Autowired
    private StatisticsRecordMapper statisticsRecordMapper;

    @Autowired
    private YardMapper yardMapper;

    @Autowired
    private YardSlotMapper yardSlotMapper;

    @Autowired
    private ContainerMapper containerMapper;

    @Autowired
    private CraneMapper craneMapper;

    @Autowired
    private TaskMapper taskMapper;

    @Autowired
    private OperationLogMapper operationLogMapper;

    @Autowired
    private YardService yardService;

    @Autowired
    private CraneService craneService;

    @Autowired
    private OperationLogService operationLogService;

    private static final int TASK_STATUS_COMPLETED = 4;
    private static final int CONTAINER_STATUS_IN_YARD = 1;
    private static final int CRANE_STATUS_WORKING = 2;
    private static final int CRANE_STATUS_IDLE = 1;
    private static final int SLOT_STATUS_OCCUPIED = 2;

    @Override
    public DashboardDataVO getDashboardData() {
        DashboardDataVO vo = new DashboardDataVO();

        List<Yard> yards = yardMapper.selectList(null);
        vo.setTotalYards(yards.size());

        List<YardSlot> slots = yardSlotMapper.selectList(null);
        int totalSlots = slots.size();
        int occupiedSlots = (int) slots.stream()
                .filter(s -> s.getStatus() != null && s.getStatus() == SLOT_STATUS_OCCUPIED)
                .count();
        vo.setTotalSlots(totalSlots);
        vo.setOccupiedSlots(occupiedSlots);
        vo.setAvailableSlots(totalSlots - occupiedSlots);
        if (totalSlots > 0) {
            vo.setOccupancyRate(BigDecimal.valueOf(occupiedSlots)
                    .divide(BigDecimal.valueOf(totalSlots), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)));
        } else {
            vo.setOccupancyRate(BigDecimal.ZERO);
        }

        List<Container> containers = containerMapper.selectList(null);
        vo.setTotalContainers(containers.size());
        int inYardContainers = (int) containers.stream()
                .filter(c -> c.getStatus() != null && c.getStatus() == CONTAINER_STATUS_IN_YARD)
                .count();
        vo.setInYardContainers(inYardContainers);

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime tomorrowStart = LocalDate.now().plusDays(1).atStartOfDay();

        LambdaQueryWrapper<OperationLog> inWrapper = new LambdaQueryWrapper<>();
        inWrapper.eq(OperationLog::getOperationType, "进场登记")
                .ge(OperationLog::getCreateTime, todayStart)
                .lt(OperationLog::getCreateTime, tomorrowStart);
        vo.setTodayInCount(Math.toIntExact(operationLogMapper.selectCount(inWrapper)));

        LambdaQueryWrapper<OperationLog> outWrapper = new LambdaQueryWrapper<>();
        outWrapper.eq(OperationLog::getOperationType, "出场登记")
                .ge(OperationLog::getCreateTime, todayStart)
                .lt(OperationLog::getCreateTime, tomorrowStart);
        vo.setTodayOutCount(Math.toIntExact(operationLogMapper.selectCount(outWrapper)));

        List<Crane> cranes = craneMapper.selectList(null);
        vo.setTotalCranes(cranes.size());
        int workingCranes = (int) cranes.stream()
                .filter(c -> c.getStatus() != null && c.getStatus() == CRANE_STATUS_WORKING)
                .count();
        int idleCranes = (int) cranes.stream()
                .filter(c -> c.getStatus() != null && c.getStatus() == CRANE_STATUS_IDLE)
                .count();
        vo.setWorkingCranes(workingCranes);
        vo.setIdleCranes(idleCranes);

        LambdaQueryWrapper<Task> taskWrapper = new LambdaQueryWrapper<>();
        taskWrapper.ge(Task::getCreateTime, todayStart)
                .lt(Task::getCreateTime, tomorrowStart);
        int todayTaskCount = Math.toIntExact(taskMapper.selectCount(taskWrapper));
        vo.setTodayTaskCount(todayTaskCount);

        LambdaQueryWrapper<Task> completedTaskWrapper = new LambdaQueryWrapper<>();
        completedTaskWrapper.eq(Task::getStatus, TASK_STATUS_COMPLETED)
                .ge(Task::getCompleteTime, todayStart)
                .lt(Task::getCompleteTime, tomorrowStart);
        int todayCompletedTaskCount = Math.toIntExact(taskMapper.selectCount(completedTaskWrapper));
        vo.setTodayCompletedTaskCount(todayCompletedTaskCount);

        if (todayTaskCount > 0) {
            vo.setTaskCompletionRate(BigDecimal.valueOf(todayCompletedTaskCount)
                    .divide(BigDecimal.valueOf(todayTaskCount), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)));
        } else {
            vo.setTaskCompletionRate(BigDecimal.ZERO);
        }

        vo.setYardOverviews(yardService.getAllYardOverviews());
        vo.setCraneLoads(craneService.getCraneLoadInfo());

        return vo;
    }

    @Override
    public List<RehandleRateVO> getRehandleRateAnalysis(LocalDate startDate, LocalDate endDate) {
        List<RehandleRateVO> result = new ArrayList<>();

        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(OperationLog::getCreateTime, startDate.atStartOfDay())
                .lt(OperationLog::getCreateTime, endDate.plusDays(1).atStartOfDay())
                .eq(OperationLog::getModule, "任务管理")
                .orderByAsc(OperationLog::getCreateTime);

        List<OperationLog> logs = operationLogMapper.selectList(wrapper);

        Map<LocalDate, List<OperationLog>> dateMap = logs.stream()
                .collect(Collectors.groupingBy(log -> log.getCreateTime().toLocalDate()));

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            RehandleRateVO vo = new RehandleRateVO();
            vo.setStatDate(date);

            List<OperationLog> dayLogs = dateMap.getOrDefault(date, new ArrayList<>());
            int totalOperations = dayLogs.size();
            int rehandleCount = (int) dayLogs.stream()
                    .filter(log -> "翻箱".equals(log.getOperationType()))
                    .count();

            vo.setTotalOperations(totalOperations);
            vo.setRehandleCount(rehandleCount);
            if (totalOperations > 0) {
                vo.setRehandleRate(BigDecimal.valueOf(rehandleCount)
                        .divide(BigDecimal.valueOf(totalOperations), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)));
            } else {
                vo.setRehandleRate(BigDecimal.ZERO);
            }

            result.add(vo);
        }

        return result;
    }

    @Override
    public List<ThroughputVO> getThroughputStatistics(LocalDate startDate, LocalDate endDate, String type) {
        List<ThroughputVO> result = new ArrayList<>();

        LocalDateTime startTime = startDate.atStartOfDay();
        LocalDateTime endTime = endDate.plusDays(1).atStartOfDay();

        LambdaQueryWrapper<Container> containerWrapper = new LambdaQueryWrapper<>();
        containerWrapper.ge(Container::getInTime, startTime)
                .lt(Container::getInTime, endTime);
        List<Container> inContainers = containerMapper.selectList(containerWrapper);

        LambdaQueryWrapper<Container> outContainerWrapper = new LambdaQueryWrapper<>();
        outContainerWrapper.ge(Container::getOutTime, startTime)
                .lt(Container::getOutTime, endTime);
        List<Container> outContainers = containerMapper.selectList(outContainerWrapper);

        Map<LocalDate, List<Container>> inMap = inContainers.stream()
                .filter(c -> c.getInTime() != null)
                .collect(Collectors.groupingBy(c -> c.getInTime().toLocalDate()));

        Map<LocalDate, List<Container>> outMap = outContainers.stream()
                .filter(c -> c.getOutTime() != null)
                .collect(Collectors.groupingBy(c -> c.getOutTime().toLocalDate()));

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            ThroughputVO vo = new ThroughputVO();
            vo.setStatDate(date);
            vo.setType(type);

            List<Container> dayIn = inMap.getOrDefault(date, new ArrayList<>());
            List<Container> dayOut = outMap.getOrDefault(date, new ArrayList<>());

            vo.setInCount(dayIn.size());
            vo.setOutCount(dayOut.size());
            vo.setMoveCount(dayIn.size() + dayOut.size());
            vo.setTotalCount(dayIn.size() + dayOut.size());

            BigDecimal totalWeight = dayIn.stream()
                    .filter(c -> c.getGrossWeight() != null)
                    .map(Container::getGrossWeight)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalWeight = totalWeight.add(dayOut.stream()
                    .filter(c -> c.getGrossWeight() != null)
                    .map(Container::getGrossWeight)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
            vo.setTotalWeight(totalWeight);

            result.add(vo);
        }

        return result;
    }

    @Override
    public List<CraneUtilizationVO> getCraneUtilization(LocalDate startDate, LocalDate endDate) {
        List<CraneUtilizationVO> result = new ArrayList<>();

        List<Crane> cranes = craneMapper.selectList(null);

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(LocalTime.MAX);

            LambdaQueryWrapper<Task> taskWrapper = new LambdaQueryWrapper<>();
            taskWrapper.ge(Task::getCompleteTime, dayStart)
                    .lt(Task::getCompleteTime, dayEnd)
                    .eq(Task::getStatus, TASK_STATUS_COMPLETED);
            List<Task> dayTasks = taskMapper.selectList(taskWrapper);

            Map<Long, List<Task>> craneTaskMap = dayTasks.stream()
                    .filter(t -> t.getCraneId() != null)
                    .collect(Collectors.groupingBy(Task::getCraneId));

            for (Crane crane : cranes) {
                CraneUtilizationVO vo = new CraneUtilizationVO();
                vo.setStatDate(date);
                vo.setCraneId(crane.getId());
                vo.setCraneCode(crane.getCraneCode());
                vo.setCraneName(crane.getCraneName());

                List<Task> craneTasks = craneTaskMap.getOrDefault(crane.getId(), new ArrayList<>());
                int totalOperationTime = craneTasks.size() * 30;
                int availableTime = 8 * 60;

                vo.setTotalOperationTime(totalOperationTime);
                vo.setAvailableTime(availableTime);
                vo.setOperationCount(craneTasks.size());
                vo.setCompletedTasks(craneTasks.size());

                if (availableTime > 0) {
                    vo.setUtilizationRate(BigDecimal.valueOf(totalOperationTime)
                            .divide(BigDecimal.valueOf(availableTime), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100)));
                } else {
                    vo.setUtilizationRate(BigDecimal.ZERO);
                }

                result.add(vo);
            }
        }

        return result;
    }

    @Override
    public List<SlotUtilizationTrendVO> getSlotUtilizationTrend(LocalDate startDate, LocalDate endDate) {
        List<SlotUtilizationTrendVO> result = new ArrayList<>();

        LambdaQueryWrapper<StatisticsRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(StatisticsRecord::getStatisticsDate, startDate)
                .le(StatisticsRecord::getStatisticsDate, endDate)
                .eq(StatisticsRecord::getStatisticsType, "DAILY")
                .orderByAsc(StatisticsRecord::getStatisticsDate);

        List<StatisticsRecord> records = statisticsRecordMapper.selectList(wrapper);
        Map<LocalDate, List<StatisticsRecord>> dateMap = records.stream()
                .collect(Collectors.groupingBy(StatisticsRecord::getStatisticsDate));

        List<Yard> yards = yardMapper.selectList(null);

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<StatisticsRecord> dayRecords = dateMap.get(date);

            if (dayRecords != null && !dayRecords.isEmpty()) {
                for (StatisticsRecord record : dayRecords) {
                    SlotUtilizationTrendVO vo = new SlotUtilizationTrendVO();
                    vo.setStatDate(date);
                    vo.setYardId(record.getYardId());
                    vo.setYardCode(record.getYardCode());
                    vo.setTotalSlots(record.getTotalSlots());
                    vo.setOccupiedSlots(record.getOccupiedSlots());
                    vo.setUtilizationRate(record.getOccupancyRate());
                    result.add(vo);
                }
            } else {
                for (Yard yard : yards) {
                    SlotUtilizationTrendVO vo = new SlotUtilizationTrendVO();
                    vo.setStatDate(date);
                    vo.setYardId(yard.getId());
                    vo.setYardCode(yard.getYardCode());
                    vo.setTotalSlots(yard.getTotalSlots());
                    vo.setOccupiedSlots(yard.getOccupiedSlots());
                    if (yard.getTotalSlots() != null && yard.getTotalSlots() > 0) {
                        vo.setUtilizationRate(BigDecimal.valueOf(yard.getOccupiedSlots())
                                .divide(BigDecimal.valueOf(yard.getTotalSlots()), 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100)));
                    } else {
                        vo.setUtilizationRate(BigDecimal.ZERO);
                    }
                    result.add(vo);
                }
            }
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean generateDailyStatistics(LocalDate statDate) {
        LocalDateTime dayStart = statDate.atStartOfDay();
        LocalDateTime dayEnd = statDate.atTime(LocalTime.MAX);

        List<Yard> yards = yardMapper.selectList(null);

        for (Yard yard : yards) {
            yardService.updateYardSlotCount(yard.getId());
            Yard updatedYard = yardMapper.selectById(yard.getId());

            LambdaQueryWrapper<YardSlot> slotWrapper = new LambdaQueryWrapper<>();
            slotWrapper.eq(YardSlot::getYardId, yard.getId());
            List<YardSlot> slots = yardSlotMapper.selectList(slotWrapper);
            int totalSlots = slots.size();
            int occupiedSlots = (int) slots.stream()
                    .filter(s -> s.getStatus() != null && s.getStatus() == SLOT_STATUS_OCCUPIED)
                    .count();
            int availableSlots = totalSlots - occupiedSlots;

            LambdaQueryWrapper<Container> inWrapper = new LambdaQueryWrapper<>();
            inWrapper.eq(Container::getYardId, yard.getId())
                    .ge(Container::getInTime, dayStart)
                    .lt(Container::getInTime, dayEnd);
            int inCount = Math.toIntExact(containerMapper.selectCount(inWrapper));

            LambdaQueryWrapper<Container> outWrapper = new LambdaQueryWrapper<>();
            outWrapper.eq(Container::getYardId, yard.getId())
                    .ge(Container::getOutTime, dayStart)
                    .lt(Container::getOutTime, dayEnd);
            int outCount = Math.toIntExact(containerMapper.selectCount(outWrapper));

            LambdaQueryWrapper<Task> taskWrapper = new LambdaQueryWrapper<>();
            taskWrapper.ge(Task::getCreateTime, dayStart)
                    .lt(Task::getCreateTime, dayEnd);
            int taskCount = Math.toIntExact(taskMapper.selectCount(taskWrapper));

            LambdaQueryWrapper<Task> completedTaskWrapper = new LambdaQueryWrapper<>();
            completedTaskWrapper.eq(Task::getStatus, TASK_STATUS_COMPLETED)
                    .ge(Task::getCompleteTime, dayStart)
                    .lt(Task::getCompleteTime, dayEnd);
            int completedTaskCount = Math.toIntExact(taskMapper.selectCount(completedTaskWrapper));

            LambdaQueryWrapper<Crane> craneWrapper = new LambdaQueryWrapper<>();
            craneWrapper.eq(Crane::getYardId, yard.getId());
            int craneCount = Math.toIntExact(craneMapper.selectCount(craneWrapper));

            int workingCraneCount = (int) craneMapper.selectList(craneWrapper).stream()
                    .filter(c -> c.getStatus() != null && c.getStatus() == CRANE_STATUS_WORKING)
                    .count();
            int idleCraneCount = craneCount - workingCraneCount;

            StatisticsRecord record = new StatisticsRecord();
            record.setStatisticsNo("STAT" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
            record.setStatisticsType("DAILY");
            record.setStatisticsDate(statDate);
            record.setYardId(yard.getId());
            record.setYardCode(yard.getYardCode());
            record.setTotalSlots(totalSlots);
            record.setOccupiedSlots(occupiedSlots);
            record.setAvailableSlots(availableSlots);
            if (totalSlots > 0) {
                record.setOccupancyRate(BigDecimal.valueOf(occupiedSlots)
                        .divide(BigDecimal.valueOf(totalSlots), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)));
            }
            record.setInCount(inCount);
            record.setOutCount(outCount);
            record.setMoveCount(inCount + outCount);
            record.setTaskCount(taskCount);
            record.setCompletedTaskCount(completedTaskCount);
            if (taskCount > 0) {
                record.setTaskCompletionRate(BigDecimal.valueOf(completedTaskCount)
                        .divide(BigDecimal.valueOf(taskCount), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)));
            }
            record.setCraneCount(craneCount);
            record.setWorkingCraneCount(workingCraneCount);
            record.setIdleCraneCount(idleCraneCount);
            if (craneCount > 0) {
                record.setCraneUtilizationRate(BigDecimal.valueOf(workingCraneCount)
                        .divide(BigDecimal.valueOf(craneCount), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)));
            }

            statisticsRecordMapper.insert(record);
        }

        operationLogService.logOperation("统计管理", "生成每日统计", null, statDate.toString(),
                null, null, null, null, null);

        return true;
    }
}
