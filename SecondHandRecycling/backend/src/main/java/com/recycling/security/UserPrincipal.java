package com.recycling.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Data
@AllArgsConstructor
public class UserPrincipal implements UserDetails {
    private Long userId;
    private String username;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(Long userId, String username, String password, String role) {
        return new UserPrincipal(
                userId,
                username,
                password,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
        );
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
