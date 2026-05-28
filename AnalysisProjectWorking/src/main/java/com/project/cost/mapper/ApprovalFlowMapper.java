package com.project.cost.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.project.cost.entity.ApprovalFlow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ApprovalFlowMapper extends BaseMapper<ApprovalFlow> {
    
    @Select("SELECT * FROM sys_approval_flow WHERE flow_type = #{flowType} AND status = 1 " +
            "AND (dept_id = #{deptId} OR dept_id IS NULL) AND (project_id = #{projectId} OR project_id IS NULL) " +
            "ORDER BY approver_order ASC")
    List<ApprovalFlow> findApprovalFlows(@Param("flowType") String flowType, @Param("deptId") Long deptId, @Param("projectId") Long projectId);
}
