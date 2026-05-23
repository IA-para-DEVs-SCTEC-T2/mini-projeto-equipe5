package com.example.taskmanager.service;

import com.example.taskmanager.domain.entity.Client;
import com.example.taskmanager.domain.entity.User;
import com.example.taskmanager.dto.request.CreateClientRequest;
import com.example.taskmanager.dto.request.UpdateClientRequest;
import com.example.taskmanager.dto.response.ClientResponse;
import com.example.taskmanager.dto.response.UserResponse;
import com.example.taskmanager.exception.ForbiddenException;
import com.example.taskmanager.exception.NotFoundException;
import com.example.taskmanager.exception.ValidationException;
import com.example.taskmanager.repository.ClientRepository;
import com.example.taskmanager.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    public ClientServiceImpl(ClientRepository clientRepository, UserRepository userRepository) {
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ClientResponse create(CreateClientRequest request, Authentication auth) {
        requireSupervisor(auth);

        Set<User> pos = resolveUsers(request.poUserIds() != null ? request.poUserIds() : List.of());

        Client client = new Client();
        client.setName(request.name());
        client.setPos(pos);

        Client saved = clientRepository.save(client);
        return toResponse(saved);
    }

    @Override
    public ClientResponse update(Long id, UpdateClientRequest request, Authentication auth) {
        requireSupervisor(auth);

        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Client", id));

        if (request.name() != null) {
            client.setName(request.name());
        }

        if (request.poUserIds() != null) {
            Set<User> pos = resolveUsers(request.poUserIds());
            client.setPos(pos);
        }

        Client saved = clientRepository.save(client);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id, Authentication auth) {
        requireSupervisor(auth);

        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Client", id));

        clientRepository.delete(client);
    }

    @Override
    @Transactional(readOnly = true)
    public ClientResponse findById(Long id) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Client", id));
        return toResponse(client);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientResponse> findAll() {
        return clientRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    private void requireSupervisor(Authentication auth) {
        boolean isSupervisor = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERVISOR"));
        if (!isSupervisor) {
            throw new ForbiddenException();
        }
    }

    private Set<User> resolveUsers(List<Long> ids) {
        Set<User> users = new HashSet<>();
        List<Long> missing = new ArrayList<>();

        for (Long id : ids) {
            userRepository.findById(id).ifPresentOrElse(
                users::add,
                () -> missing.add(id)
            );
        }

        if (!missing.isEmpty()) {
            throw new ValidationException("Referenced users not found", List.of(
                new ValidationException.FieldError("poUserIds", "Users not found: " + missing)
            ));
        }

        return users;
    }

    private ClientResponse toResponse(Client client) {
        List<UserResponse> pos = client.getPos().stream()
            .map(u -> new UserResponse(u.getId(), u.getEmail(), u.getName(), u.getRole().name()))
            .toList();
        return new ClientResponse(client.getId(), client.getName(), pos);
    }
}
