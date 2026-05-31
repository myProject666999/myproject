package com.votingscheduling.service;

import com.votingscheduling.entity.Team;
import com.votingscheduling.entity.TeamMember;
import com.votingscheduling.entity.User;
import com.votingscheduling.repository.TeamMemberRepository;
import com.votingscheduling.repository.TeamRepository;
import com.votingscheduling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    public List<Team> findAll() {
        return teamRepository.findAll();
    }

    public Team findById(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team does not exist"));
    }

    public List<Team> findByLeaderId(Long leaderId) {
        return teamRepository.findByLeaderId(leaderId);
    }

    @Transactional
    public Team create(Team team, Long leaderId) {
        team.setLeaderId(leaderId);
        team.setStatus("ACTIVE");
        team = teamRepository.save(team);

        TeamMember member = TeamMember.builder()
                .teamId(team.getId())
                .userId(leaderId)
                .isLeader(true)
                .build();
        teamMemberRepository.save(member);

        return team;
    }

    @Transactional
    public Team update(Long id, Team team) {
        Team existing = findById(id);
        if (team.getName() != null) existing.setName(team.getName());
        if (team.getDescription() != null) existing.setDescription(team.getDescription());
        return teamRepository.save(existing);
    }

    @Transactional
    public void addMember(Long teamId, Long userId) {
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("Member already in team");
        }
        TeamMember member = TeamMember.builder()
                .teamId(teamId)
                .userId(userId)
                .isLeader(false)
                .build();
        teamMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(Long teamId, Long userId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException("Member not in team"));
        if (Boolean.TRUE.equals(member.getIsLeader())) {
            throw new RuntimeException("Cannot remove team leader");
        }
        teamMemberRepository.delete(member);
    }

    public List<User> getTeamMembers(Long teamId) {
        List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);
        return members.stream()
                .map(m -> userRepository.findById(m.getUserId()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<Team> getUserTeams(Long userId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);
        return memberships.stream()
                .map(m -> teamRepository.findById(m.getTeamId()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    public boolean isTeamMember(Long teamId, Long userId) {
        return teamMemberRepository.existsByTeamIdAndUserId(teamId, userId);
    }

    public boolean isTeamLeader(Long teamId, Long userId) {
        return teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .map(TeamMember::getIsLeader)
                .orElse(false);
    }
}