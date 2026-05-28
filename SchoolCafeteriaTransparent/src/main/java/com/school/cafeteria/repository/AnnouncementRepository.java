package com.school.cafeteria.repository;

import com.school.cafeteria.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByStatusOrderByIsTopDescPublishTimeDesc(Integer status);

    List<Announcement> findByType(String type);

    @Query("SELECT a FROM Announcement a WHERE a.status = 1 ORDER BY a.isTop DESC, a.publishTime DESC")
    List<Announcement> findAllPublished();
}
