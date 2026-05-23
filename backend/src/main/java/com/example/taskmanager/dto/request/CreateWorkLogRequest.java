package com.example.taskmanager.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

public record CreateWorkLogRequest(
    String description,
    @NotNull LocalDateTime datetimeStart,
    @NotNull LocalDateTime datetimeEnd,
    @NotEmpty List<Long> taskIds
) {}
