package com.example.taskmanager.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public record CreateProjectRequest(
    @NotBlank String name,
    @NotNull LocalDate startDate,
    @NotNull LocalDate endDate,
    @NotEmpty List<Long> clientIds,
    List<Long> supervisorUserIds
) {}
