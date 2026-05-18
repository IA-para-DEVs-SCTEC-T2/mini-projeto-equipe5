package com.example.taskmanager.exception;

import java.util.List;

public class ValidationException extends AppException {
    private final List<FieldError> fields;

    public ValidationException(String message, List<FieldError> fields) {
        super(422, "VALIDATION_ERROR", message);
        this.fields = fields;
    }

    public List<FieldError> getFields() { return fields; }

    public record FieldError(String field, String message) {}
}
