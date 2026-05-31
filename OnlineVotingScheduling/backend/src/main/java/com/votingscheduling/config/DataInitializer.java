package com.votingscheduling.config;

import com.votingscheduling.entity.Team;
import com.votingscheduling.entity.TeamMember;
import com.votingscheduling.entity.User;
import com.votingscheduling.repository.TeamMemberRepository;
import com.votingscheduling.repository.TeamRepository;
import com.votingscheduling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isPresent()) {
            return;
        }

        User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .realName("系统管理员")
                .email("admin@example.com")
                .role("ADMIN")
                .status("ACTIVE")
                .build();
        admin = userRepository.save(admin);

        Team team = Team.builder()
                .name("默认团队")
                .description("系统默认创建的团队")
                .leaderId(admin.getId())
                .status("ACTIVE")
                .build();
        team = teamRepository.save(team);

        TeamMember member = TeamMember.builder()
                .teamId(team.getId())
                .userId(admin.getId())
                .isLeader(true)
                .build();
        teamMemberRepository.save(member);
    }
}
