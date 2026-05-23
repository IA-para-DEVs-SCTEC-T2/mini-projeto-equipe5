package com.example.taskmanager.service;

import com.example.taskmanager.domain.entity.User;
import com.example.taskmanager.dto.request.LoginRequest;
import com.example.taskmanager.dto.request.RegisterRequest;
import com.example.taskmanager.exception.ConflictException;
import com.example.taskmanager.exception.UnauthorizedException;
import com.example.taskmanager.exception.ValidationException;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void register_throwsConflictException_whenEmailAlreadyExists() {
        when(userRepository.findByEmail("user@example.com"))
            .thenReturn(Optional.of(new User()));

        RegisterRequest request = new RegisterRequest("user@example.com", "User", "password123");

        assertThatThrownBy(() -> authService.register(request))
            .isInstanceOf(ConflictException.class)
            .hasMessage("Email already in use");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_throwsValidationException_whenPasswordTooShort() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());

        RegisterRequest request = new RegisterRequest("user@example.com", "User", "short");

        assertThatThrownBy(() -> authService.register(request))
            .isInstanceOf(ValidationException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_throwsUnauthorizedException_whenPasswordDoesNotMatch() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setPasswordHash("encoded-hash");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-hash")).thenReturn(false);

        LoginRequest request = new LoginRequest("user@example.com", "wrong-password");

        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(UnauthorizedException.class);

        verify(jwtService, never()).generateToken(any());
    }
}
