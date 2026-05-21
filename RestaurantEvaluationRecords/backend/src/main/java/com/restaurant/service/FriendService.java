package com.restaurant.service;

import com.restaurant.entity.FriendRelation;
import com.restaurant.entity.User;
import com.restaurant.repository.FriendRelationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FriendService {

    @Autowired
    private FriendRelationRepository friendRelationRepository;

    public List<User> getFriends(Long userId) {
        return friendRelationRepository.findFriendsByUserId(userId);
    }

    @Transactional
    public FriendRelation addFriend(Long userId, Long friendId) {
        if (userId.equals(friendId)) {
            throw new RuntimeException("不能添加自己为好友");
        }

        Optional<FriendRelation> existingRelation = friendRelationRepository.findByUserIdAndFriendId(userId, friendId);
        if (existingRelation.isPresent()) {
            FriendRelation relation = existingRelation.get();
            relation.setStatus(1);
            return friendRelationRepository.save(relation);
        }

        FriendRelation relation = new FriendRelation();
        relation.setUserId(userId);
        relation.setFriendId(friendId);
        friendRelationRepository.save(relation);

        FriendRelation reverseRelation = new FriendRelation();
        reverseRelation.setUserId(friendId);
        reverseRelation.setFriendId(userId);
        return friendRelationRepository.save(reverseRelation);
    }

    @Transactional
    public void removeFriend(Long userId, Long friendId) {
        friendRelationRepository.findByUserIdAndFriendId(userId, friendId).ifPresent(relation -> {
            relation.setStatus(0);
            friendRelationRepository.save(relation);
        });
        friendRelationRepository.findByUserIdAndFriendId(friendId, userId).ifPresent(relation -> {
            relation.setStatus(0);
            friendRelationRepository.save(relation);
        });
    }

    public boolean isFriend(Long userId, Long friendId) {
        return friendRelationRepository.findByUserIdAndFriendId(userId, friendId)
                .map(relation -> relation.getStatus() == 1)
                .orElse(false);
    }
}
