package com.restaurant.repository;

import com.restaurant.entity.FriendRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRelationRepository extends JpaRepository<FriendRelation, Long> {
    Optional<FriendRelation> findByUserIdAndFriendId(Long userId, Long friendId);
    List<FriendRelation> findByUserIdAndStatus(Long userId, Integer status);

    @Query("SELECT u FROM User u WHERE u.id IN (SELECT fr.friendId FROM FriendRelation fr WHERE fr.userId = :userId AND fr.status = 1)")
    List<com.restaurant.entity.User> findFriendsByUserId(@Param("userId") Long userId);
}
