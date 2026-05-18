package com.example.taskmanager.dto.request;

import java.time.LocalDate;
import java.util.List;

public record UpdateProjectRequest(String name, LocalDate startDate, LocalDate endDate, List<Long> clientIds, List<Long> supervisorUserIds) {}
