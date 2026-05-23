package com.example.taskmanager.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record TaskResponse(Long id, String title, String description, LocalDateTime datetimeStart, LocalDateTime datetimeEnd, List<EpicResponse> epics) {}
