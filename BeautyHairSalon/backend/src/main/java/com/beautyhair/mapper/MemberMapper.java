
package com.beautyhair.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beautyhair.entity.Member;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface MemberMapper extends BaseMapper<Member> {

    @Select("SELECT COUNT(*) FROM member WHERE deleted = 0 AND DATE_FORMAT(birthday, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')")
    Long countTodayBirthdays();

    @Select("SELECT COUNT(*) FROM member WHERE deleted = 0 AND register_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)")
    Long countNewMembersLast30Days();
}
