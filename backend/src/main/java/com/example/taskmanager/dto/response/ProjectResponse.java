package com.example.taskmanager.dto.response;

import java.time.LocalDate;
import java.util.List;

public record ProjectResponse(Long id, String name, LocalDate startDate, LocalDate endDate, List<ClientResponse> clients, List<UserResponse> supervisors) {}
