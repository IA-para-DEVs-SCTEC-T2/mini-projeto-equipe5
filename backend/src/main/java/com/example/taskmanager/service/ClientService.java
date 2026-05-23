package com.example.taskmanager.service;

import com.example.taskmanager.dto.request.CreateClientRequest;
import com.example.taskmanager.dto.request.UpdateClientRequest;
import com.example.taskmanager.dto.response.ClientResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ClientService {
    ClientResponse create(CreateClientRequest request, Authentication auth);
    ClientResponse update(Long id, UpdateClientRequest request, Authentication auth);
    void delete(Long id, Authentication auth);
    ClientResponse findById(Long id);
    List<ClientResponse> findAll();
}
