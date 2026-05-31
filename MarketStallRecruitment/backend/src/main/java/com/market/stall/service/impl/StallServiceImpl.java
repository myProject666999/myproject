package com.market.stall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.market.stall.dto.StallDTO;
import com.market.stall.entity.Registration;
import com.market.stall.entity.Stall;
import com.market.stall.entity.SysUser;
import com.market.stall.exception.BusinessException;
import com.market.stall.mapper.RegistrationMapper;
import com.market.stall.mapper.StallMapper;
import com.market.stall.mapper.SysUserMapper;
import com.market.stall.service.StallService;
import com.market.stall.vo.StallMapVO;
import com.market.stall.vo.StallVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StallServiceImpl implements StallService {

    private final StallMapper stallMapper;
    private final RegistrationMapper registrationMapper;
    private final SysUserMapper sysUserMapper;

    @Override
    public List<StallVO> getStallsByEvent(Long eventId) {
        List<Stall> stalls = stallMapper.selectList(
                new LambdaQueryWrapper<Stall>().eq(Stall::getEventId, eventId)
        );
        return stalls.stream().map(this::toStallVO).collect(Collectors.toList());
    }

    @Override
    public StallMapVO getStallMap(Long eventId) {
        List<Stall> stalls = stallMapper.selectList(
                new LambdaQueryWrapper<Stall>().eq(Stall::getEventId, eventId)
        );
        Map<String, List<Stall>> zoneMap = stalls.stream()
                .collect(Collectors.groupingBy(s -> s.getZone() != null ? s.getZone() : "默认"));
        StallMapVO mapVO = new StallMapVO();
        mapVO.setEventId(eventId);
        List<StallMapVO.ZoneVO> zones = new ArrayList<>();
        for (Map.Entry<String, List<Stall>> entry : zoneMap.entrySet()) {
            StallMapVO.ZoneVO zoneVO = new StallMapVO.ZoneVO();
            zoneVO.setZone(entry.getKey());
            zoneVO.setStalls(entry.getValue().stream().map(this::toStallVO).collect(Collectors.toList()));
            zones.add(zoneVO);
        }
        mapVO.setZones(zones);
        return mapVO;
    }

    @Override
    public void createStall(StallDTO dto) {
        Stall stall = new Stall();
        BeanUtils.copyProperties(dto, stall);
        stall.setStatus(0);
        stallMapper.insert(stall);
    }

    @Override
    public void batchCreateStalls(List<StallDTO> dtoList) {
        for (StallDTO dto : dtoList) {
            createStall(dto);
        }
    }

    @Override
    public void updateStall(Long id, StallDTO dto) {
        Stall stall = stallMapper.selectById(id);
        if (stall == null) {
            throw new BusinessException("摊位不存在");
        }
        BeanUtils.copyProperties(dto, stall);
        stall.setId(id);
        stallMapper.updateById(stall);
    }

    @Override
    public void deleteStall(Long id) {
        Stall stall = stallMapper.selectById(id);
        if (stall == null) {
            throw new BusinessException("摊位不存在");
        }
        stallMapper.deleteById(id);
    }

    private StallVO toStallVO(Stall stall) {
        StallVO vo = new StallVO();
        BeanUtils.copyProperties(stall, vo);
        if (stall.getStatus() != null && stall.getStatus() != 0 && stall.getId() != null) {
            Registration registration = registrationMapper.selectOne(
                    new LambdaQueryWrapper<Registration>()
                            .eq(Registration::getStallId, stall.getId())
                            .ne(Registration::getStatus, 4)
                            .last("LIMIT 1")
            );
            if (registration != null) {
                SysUser user = sysUserMapper.selectById(registration.getUserId());
                if (user != null) {
                    vo.setOccupierName(user.getRealName() != null ? user.getRealName() : user.getUsername());
                }
            }
        }
        return vo;
    }
}
