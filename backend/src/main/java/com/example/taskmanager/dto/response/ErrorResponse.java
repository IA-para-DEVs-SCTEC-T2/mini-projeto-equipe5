package com.example.taskmanager.dto.response;

import java.util.List;

public record ErrorResponse(
    String code,
    String message,
    List<FieldError> fields
) {
    public record FieldError(String field, String message) {}
}
