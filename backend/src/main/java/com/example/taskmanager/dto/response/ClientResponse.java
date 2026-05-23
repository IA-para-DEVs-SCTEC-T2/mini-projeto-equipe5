package com.example.taskmanager.dto.response;

import java.util.List;

public record ClientResponse(Long id, String name, List<UserResponse> pos) {}
