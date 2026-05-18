package com.example.taskmanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateClientRequest(@NotBlank String name, List<Long> poUserIds) {}
