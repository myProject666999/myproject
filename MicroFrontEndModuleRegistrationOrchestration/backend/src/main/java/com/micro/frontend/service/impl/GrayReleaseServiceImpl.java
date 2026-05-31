package com.micro.frontend.service.impl;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.GrayCreateDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.GrayRelease;
import com.micro.frontend.entity.GrayUser;
import com.micro.frontend.mapper.GrayReleaseMapper;
import com.micro.frontend.mapper.GrayUserMapper;
import com.micro.frontend.mapper.MicroAppMapper;
import com.micro.frontend.service.IGrayReleaseService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class GrayReleaseServiceImpl implements IGrayReleaseService {

    @Autowired
    private GrayReleaseMapper grayReleaseMapper;

    @Autowired
    private GrayUserMapper grayUserMapper;

    @Autowired
    private MicroAppMapper microAppMapper;

    @Override
    public GrayRelease getById(Long id) {
        return grayReleaseMapper.selectById(id);
    }

    @Override
    public GrayRelease getByGrayNo(String grayNo) {
        return grayReleaseMapper.selectByGrayNo(grayNo);
    }

    @Override
    public PageResult<GrayRelease> page(PageQueryDTO query) {
        List<GrayRelease> list = grayReleaseMapper.selectList(query);
        Long total = grayReleaseMapper.selectCount(query);
        return PageResult.of(list, total, query.getPageNum(), query.getPageSize());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean create(GrayCreateDTO dto) {
        GrayRelease activeGray = grayReleaseMapper.selectActiveGray(dto.getAppId());
        if (activeGray != null) {
            throw new RuntimeException("该应用已有进行中的灰度发布");
        }
        GrayRelease gray = new GrayRelease();
        BeanUtils.copyProperties(dto, gray);
        gray.setGrayNo(generateGrayNo());
        gray.setStatus(0);
        gray.setHitCount(0L);
        gray.setTotalCount(0L);
        gray.setCreatedAt(LocalDateTime.now());
        gray.setUpdatedAt(LocalDateTime.now());
        int result = grayReleaseMapper.insert(gray);
        if (result > 0 && "USER".equals(dto.getGrayType()) && dto.getGrayValue() != null) {
            saveGrayUsers(gray.getId(), dto.getGrayValue());
        }
        return result > 0;
    }

    private String generateGrayNo() {
        return "GR" + System.currentTimeMillis() + new Random().nextInt(1000);
    }

    private void saveGrayUsers(Long grayReleaseId, String userIds) {
        String[] userIdArray = userIds.split(",");
        List<GrayUser> grayUsers = new ArrayList<>();
        for (String userId : userIdArray) {
            GrayUser gu = new GrayUser();
            gu.setGrayReleaseId(grayReleaseId);
            gu.setUserId(userId.trim());
            gu.setUserType("NORMAL");
            gu.setCreatedAt(LocalDateTime.now());
            grayUsers.add(gu);
        }
        grayUserMapper.batchInsert(grayUsers);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(GrayRelease gray) {
        gray.setUpdatedAt(LocalDateTime.now());
        return grayReleaseMapper.updateById(gray) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        GrayRelease gray = grayReleaseMapper.selectById(id);
        if (gray != null && gray.getStatus() == 1) {
            throw new RuntimeException("灰度进行中，无法删除");
        }
        grayUserMapper.deleteByGrayReleaseId(id);
        return grayReleaseMapper.updateStatus(id, 4) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean start(Long id) {
        GrayRelease gray = grayReleaseMapper.selectById(id);
        if (gray == null || gray.getStatus() != 0) {
            throw new RuntimeException("灰度状态不正确，无法开始");
        }
        gray.setStatus(1);
        gray.setStartTime(LocalDateTime.now());
        gray.setUpdatedAt(LocalDateTime.now());
        grayReleaseMapper.updateById(gray);
        microAppMapper.updateStatus(gray.getAppId(), 2);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean pause(Long id) {
        GrayRelease gray = grayReleaseMapper.selectById(id);
        if (gray == null || gray.getStatus() != 1) {
            throw new RuntimeException("灰度状态不正确，无法暂停");
        }
        gray.setStatus(2);
        gray.setUpdatedAt(LocalDateTime.now());
        return grayReleaseMapper.updateById(gray) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean full(Long id) {
        GrayRelease gray = grayReleaseMapper.selectById(id);
        if (gray == null || (gray.getStatus() != 1 && gray.getStatus() != 2)) {
            throw new RuntimeException("灰度状态不正确，无法全量");
        }
        gray.setStatus(3);
        gray.setEndTime(LocalDateTime.now());
        gray.setUpdatedAt(LocalDateTime.now());
        grayReleaseMapper.updateById(gray);
        microAppMapper.updateCurrentVersion(gray.getAppId(), gray.getTargetVersion());
        microAppMapper.updateStatus(gray.getAppId(), 1);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean rollback(Long id) {
        GrayRelease gray = grayReleaseMapper.selectById(id);
        if (gray == null || (gray.getStatus() != 1 && gray.getStatus() != 2)) {
            throw new RuntimeException("灰度状态不正确，无法回滚");
        }
        gray.setStatus(4);
        gray.setEndTime(LocalDateTime.now());
        gray.setUpdatedAt(LocalDateTime.now());
        grayReleaseMapper.updateById(gray);
        microAppMapper.updateCurrentVersion(gray.getAppId(), gray.getBaseVersion());
        microAppMapper.updateStatus(gray.getAppId(), 1);
        return true;
    }

    @Override
    public GrayRelease getActiveGray(Long appId) {
        return grayReleaseMapper.selectActiveGray(appId);
    }

    @Override
    public Map<String, Object> judge(Long appId, String userId, String userType) {
        Map<String, Object> result = new HashMap<>();
        GrayRelease gray = grayReleaseMapper.selectActiveGray(appId);
        incrementTotalCount(gray != null ? gray.getId() : null);
        if (gray == null) {
            result.put("hit", false);
            return result;
        }
        boolean hit = false;
        if ("USER".equals(gray.getGrayType())) {
            GrayUser grayUser = grayUserMapper.selectByGrayReleaseIdAndUserId(gray.getId(), userId);
            hit = grayUser != null;
        } else if ("PROPORTION".equals(gray.getGrayType())) {
            try {
                int proportion = Integer.parseInt(gray.getGrayValue());
                int hash = Math.abs(userId.hashCode()) % 100;
                hit = hash < proportion;
            } catch (NumberFormatException e) {
                hit = false;
            }
        }
        if (hit) {
            incrementHitCount(gray.getId());
            result.put("hit", true);
            result.put("targetVersion", gray.getTargetVersion());
            result.put("targetVersionId", gray.getTargetVersionId());
        } else {
            result.put("hit", false);
            result.put("baseVersion", gray.getBaseVersion());
            result.put("baseVersionId", gray.getBaseVersionId());
        }
        result.put("grayNo", gray.getGrayNo());
        result.put("grayType", gray.getGrayType());
        return result;
    }

    @Override
    public boolean incrementHitCount(Long id) {
        if (id == null) return false;
        return grayReleaseMapper.incrementHitCount(id) > 0;
    }

    @Override
    public boolean incrementTotalCount(Long id) {
        if (id == null) return false;
        return grayReleaseMapper.incrementTotalCount(id) > 0;
    }
}
