package com.mortgage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mortgage.entity.RepaymentPlan;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RepaymentPlanMapper extends BaseMapper<RepaymentPlan> {

    @Select("SELECT * FROM repayment_plan WHERE loan_scheme_id = #{loanSchemeId} ORDER BY period")
    List<RepaymentPlan> selectByLoanSchemeId(@Param("loanSchemeId") Long loanSchemeId);

    @Select("SELECT * FROM repayment_plan WHERE loan_scheme_id = #{loanSchemeId} AND period = #{period}")
    RepaymentPlan selectByLoanSchemeIdAndPeriod(@Param("loanSchemeId") Long loanSchemeId, @Param("period") Integer period);
}
