package com.example.taskmanager.service;

import com.example.taskmanager.dto.request.CreateClientRequest;
import com.example.taskmanager.exception.ForbiddenException;
import com.example.taskmanager.repository.ClientRepository;
import com.example.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientServiceImplTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ClientServiceImpl clientService;

    @Test
    void create_throwsForbiddenException_whenUserIsNotSupervisor() {
        Authentication auth = mock(Authentication.class);
        when(auth.getAuthorities()).thenAnswer(
            ignored -> List.of(new SimpleGrantedAuthority("ROLE_REGULAR_USER"))
        );

        CreateClientRequest request = new CreateClientRequest("Acme Corp", List.of());

        assertThatThrownBy(() -> clientService.create(request, auth))
            .isInstanceOf(ForbiddenException.class);
    }
}
