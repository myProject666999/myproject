package com.meeting.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.meeting.dto.PageResult;
import com.meeting.dto.ReservationCancelDTO;
import com.meeting.dto.ReservationCreateDTO;
import com.meeting.dto.ReservationQueryDTO;
import com.meeting.entity.Reservation;
import com.meeting.exception.BusinessException;
import com.meeting.mapper.ReservationMapper;
import com.meeting.service.ReservationService;
import com.meeting.util.RedisLockUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ReservationServiceImpl extends ServiceImpl<ReservationMapper, Reservation>
        implements ReservationService {

    @Autowired
    private ReservationMapper reservationMapper;

    @Autowired
    private RedisLockUtil redisLockUtil;

    @Value("${reservation.max-days-ahead:30}")
    private int maxDaysAhead;

    @Value("${reservation.min-cancel-hours:2}")
    private int minCancelHours;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createReservation(ReservationCreateDTO dto, Long userId) {
        validateReservationTime(dto);

        String lockKey = "meeting:reservation:" + dto.getRoomId();
        boolean locked = redisLockUtil.tryLock(lockKey, 30, TimeUnit.SECONDS);
        if (!locked) {
            throw new BusinessException("系统繁忙，请稍后重试");
        }

        try {
            List<Reservation> conflicts = reservationMapper.findConflictingReservations(
                    dto.getRoomId(), dto.getStartTime(), dto.getEndTime());
            if (!conflicts.isEmpty()) {
                throw new BusinessException("该时段已被预订，请选择其他时间");
            }

            Reservation reservation = new Reservation();
            reservation.setUserId(userId);
            reservation.setRoomId(dto.getRoomId());
            reservation.setTitle(dto.getTitle());
            reservation.setStartTime(dto.getStartTime());
            reservation.setEndTime(dto.getEndTime());
            reservation.setStatus(1);
            reservation.setAttendees(dto.getAttendees());
            reservation.setDescription(dto.getDescription());

            return save(reservation);
        } finally {
            redisLockUtil.unlock(lockKey);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancelReservation(ReservationCancelDTO dto, Long userId) {
        Reservation reservation = getById(dto.getId());
        if (reservation == null) {
            throw new BusinessException("预订记录不存在");
        }

        if (!reservation.getUserId().equals(userId)) {
            throw new BusinessException("无权取消他人的预订");
        }

        if (reservation.getStatus() != 1) {
            throw new BusinessException("当前状态不允许取消");
        }

        LocalDateTime now = LocalDateTime.now();
        long hoursUntilMeeting = ChronoUnit.HOURS.between(now, reservation.getStartTime());
        if (hoursUntilMeeting < minCancelHours) {
            throw new BusinessException("距离会议开始不足" + minCancelHours + "小时，无法取消");
        }

        reservation.setStatus(0);
        reservation.setCancelReason(dto.getCancelReason());
        return updateById(reservation);
    }

    @Override
    public PageResult<Reservation> getReservationPage(Integer pageNum, Integer pageSize, ReservationQueryDTO query) {
        Page<Reservation> page = new Page<>(pageNum, pageSize);
        IPage<Reservation> result = reservationMapper.selectReservationPage(page, query);
        return PageResult.of(result.getTotal(), result.getRecords(), pageNum, pageSize);
    }

    @Override
    public List<Reservation> getMyReservations(Long userId) {
        return reservationMapper.findByUserIdWithDetail(userId);
    }

    @Override
    public List<Reservation> getRoomReservations(Long roomId) {
        LambdaQueryWrapper<Reservation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Reservation::getRoomId, roomId)
                .in(Reservation::getStatus, 1, 2)
                .orderByAsc(Reservation::getStartTime);
        return list(wrapper);
    }

    @Override
    public boolean checkAvailability(Long roomId, String startTime, String endTime) {
        LocalDateTime start = LocalDateTime.parse(startTime);
        LocalDateTime end = LocalDateTime.parse(endTime);
        List<Reservation> conflicts = reservationMapper.findConflictingReservations(roomId, start, end);
        return conflicts.isEmpty();
    }

    private void validateReservationTime(ReservationCreateDTO dto) {
        LocalDateTime now = LocalDateTime.now();

        if (dto.getStartTime().isBefore(now)) {
            throw new BusinessException("开始时间不能早于当前时间");
        }

        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new BusinessException("结束时间必须晚于开始时间");
        }

        LocalDateTime maxDate = now.plusDays(maxDaysAhead);
        if (dto.getStartTime().isAfter(maxDate)) {
            throw new BusinessException("只能预订未来" + maxDaysAhead + "天内的会议室");
        }

        long durationMinutes = ChronoUnit.MINUTES.between(dto.getStartTime(), dto.getEndTime());
        if (durationMinutes < 15) {
            throw new BusinessException("会议时长不能少于15分钟");
        }

        if (durationMinutes > 480) {
            throw new BusinessException("会议时长不能超过8小时");
        }

        if (dto.getStartTime().getMinute() % 30 != 0 || dto.getEndTime().getMinute() % 30 != 0) {
            throw new BusinessException("预订时间必须以30分钟为单位");
        }
    }
}
