package com.example.taskmanager.dto.request;

import java.time.LocalDateTime;
import java.util.List;

public record UpdateWorkLogRequest(String description, LocalDateTime datetimeStart, LocalDateTime datetimeEnd, List<Long> taskIds) {}
