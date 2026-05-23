package com.example.taskmanager.dto.response;

import java.time.LocalDate;
import java.util.List;

public record EpicResponse(Long id, String title, String description, LocalDate startDate, LocalDate endDate, List<ProjectResponse> projects) {}
