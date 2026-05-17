package com.family.ledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.ledger.entity.Bill;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface BillMapper extends BaseMapper<Bill> {

    @Select("SELECT * FROM bill WHERE family_id = #{familyId} AND status = 1 " +
            "AND bill_date BETWEEN #{startDate} AND #{endDate} ORDER BY bill_date DESC")
    List<Bill> selectByFamilyIdAndDateRange(
            @Param("familyId") Long familyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
