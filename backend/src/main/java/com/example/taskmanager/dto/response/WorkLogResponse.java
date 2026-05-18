package com.example.taskmanager.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record WorkLogResponse(Long id, String description, LocalDateTime datetimeStart, LocalDateTime datetimeEnd, List<TaskResponse> tasks) {}
