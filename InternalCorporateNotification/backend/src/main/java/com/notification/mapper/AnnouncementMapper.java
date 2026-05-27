package com.notification.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.notification.entity.Announcement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface AnnouncementMapper extends BaseMapper<Announcement> {

    @Select("SELECT a.*, c.name as category_name, d.name as department_name, " +
            "CASE WHEN ar.id IS NOT NULL THEN 1 ELSE 0 END as is_read " +
            "FROM announcement a " +
            "LEFT JOIN announcement_category c ON a.category_id = c.id " +
            "LEFT JOIN sys_department d ON a.department_id = d.id " +
            "LEFT JOIN announcement_read ar ON a.id = ar.announcement_id AND ar.user_id = #{userId} " +
            "${ew.customSqlSegment} " +
            "ORDER BY a.priority DESC, a.publish_time DESC")
    IPage<Announcement> selectAnnouncementPage(IPage<Announcement> page,
                                               @Param(Constants.WRAPPER) Wrapper<Announcement> wrapper,
                                               @Param("userId") Long userId);

    @Select("SELECT COUNT(*) FROM announcement a " +
            "WHERE a.status = 1 AND a.is_all_departments = 1 " +
            "AND a.id NOT IN (SELECT announcement_id FROM announcement_read WHERE user_id = #{userId})")
    Integer countUnreadAll(@Param("userId") Long userId);

    @Select("SELECT COUNT(*) FROM announcement a " +
            "WHERE a.status = 1 AND a.is_all_departments = 0 " +
            "AND FIND_IN_SET(#{departmentId}, a.target_departments) " +
            "AND a.id NOT IN (SELECT announcement_id FROM announcement_read WHERE user_id = #{userId})")
    Integer countUnreadByDepartment(@Param("userId") Long userId, @Param("departmentId") Long departmentId);
}
