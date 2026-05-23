package com.example.taskmanager.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public record CreateEpicRequest(
    @NotBlank String title,
    String description,
    @NotNull LocalDate startDate,
    @NotNull LocalDate endDate,
    @NotEmpty List<Long> projectIds
) {}
