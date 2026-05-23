package com.example.taskmanager.dto.request;

import java.util.List;

public record UpdateClientRequest(String name, List<Long> poUserIds) {}
