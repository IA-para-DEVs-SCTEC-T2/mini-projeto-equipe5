package com.example.taskmanager.security;

import com.example.taskmanager.domain.entity.User;
import com.example.taskmanager.domain.enums.Role;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(
            jwtService,
            "secretKey",
            "dGhpcy1pcy1hLXRlc3Qtc2VjcmV0LWtleS1mb3ItZGV2LW9ubHktMzI="
        );
        ReflectionTestUtils.setField(jwtService, "expiryMs", 86_400_000L);
    }

    @Test
    void generateToken_andParseToken_containUserClaims() {
        User user = new User();
        user.setId(42L);
        user.setRole(Role.SUPERVISOR);

        String token = jwtService.generateToken(user);
        Claims claims = jwtService.parseToken(token);

        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.get("role", String.class)).isEqualTo("SUPERVISOR");
        assertThat(jwtService.getExpirySeconds()).isEqualTo(86_400L);
    }
}
