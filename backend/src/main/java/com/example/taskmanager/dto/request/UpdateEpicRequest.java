package com.example.taskmanager.dto.request;

import java.time.LocalDate;
import java.util.List;

public record UpdateEpicRequest(String title, String description, LocalDate startDate, LocalDate endDate, List<Long> projectIds) {}
