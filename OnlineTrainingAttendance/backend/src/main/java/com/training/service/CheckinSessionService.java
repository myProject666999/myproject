package com.training.service;

import com.training.common.Result;
import com.training.common.ResultCode;
import com.training.entity.CheckinSession;
import com.training.entity.Training;
import com.training.repository.CheckinSessionRepository;
import com.training.repository.TrainingRepository;
import com.training.util.QRCodeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckinSessionService {

    private final CheckinSessionRepository checkinSessionRepository;
    private final TrainingRepository trainingRepository;

    @Transactional
    public Result<CheckinSession> create(Long trainingId, Long createdBy,
                                         Integer durationMinutes, String baseUrl) {
        Optional<Training> trainingOpt = trainingRepository.findById(trainingId);
        if (!trainingOpt.isPresent()) {
            return Result.fail(ResultCode.TRAINING_NOT_FOUND);
        }
        LocalDateTime now = LocalDateTime.now();
        int minutes = durationMinutes == null || durationMinutes <= 0 ? 30 : durationMinutes;
        String token = UUID.randomUUID().toString().replace("-", "");
        String content = (baseUrl == null ? "" : baseUrl) + "/checkin?token=" + token;
        CheckinSession session = new CheckinSession();
        session.setTrainingId(trainingId);
        session.setSessionToken(token);
        session.setExpireTime(now.plusMinutes(minutes));
        session.setIsActive(1);
        session.setCreatedBy(createdBy);
        session.setCreatedAt(now);
        try {
            byte[] qrBytes = QRCodeUtil.generateBytes(content);
            String dataUrl = "data:image/png;base64," + Base64.getEncoder().encodeToString(qrBytes);
            session.setQrCodeContent(dataUrl);
        } catch (Exception e) {
            session.setQrCodeContent(content);
        }
        return Result.success(checkinSessionRepository.save(session));
    }

    public Result<String> deactivate(Long id) {
        Optional<CheckinSession> optional = checkinSessionRepository.findById(id);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        CheckinSession s = optional.get();
        s.setIsActive(0);
        s.setExpireTime(LocalDateTime.now());
        checkinSessionRepository.save(s);
        return Result.success("已结束签到会话");
    }

    public Result<String> delete(Long id) {
        if (!checkinSessionRepository.existsById(id)) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        checkinSessionRepository.deleteById(id);
        return Result.success("删除成功");
    }

    public Result<CheckinSession> getById(Long id) {
        Optional<CheckinSession> optional = checkinSessionRepository.findById(id);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        return Result.success(optional.get());
    }

    public Result<CheckinSession> getByToken(String sessionToken) {
        Optional<CheckinSession> optional = checkinSessionRepository
                .findValidBySessionToken(sessionToken, LocalDateTime.now());
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        return Result.success(optional.get());
    }

    public Result<List<CheckinSession>> listByTraining(Long trainingId) {
        return Result.success(checkinSessionRepository.findByTrainingId(trainingId));
    }

    public Result<List<CheckinSession>> listActiveByTraining(Long trainingId) {
        return Result.success(checkinSessionRepository.findActiveSessionsByTrainingId(trainingId, LocalDateTime.now()));
    }

    public Result<List<CheckinSession>> listAll() {
        return Result.success(checkinSessionRepository.findAll());
    }
}
