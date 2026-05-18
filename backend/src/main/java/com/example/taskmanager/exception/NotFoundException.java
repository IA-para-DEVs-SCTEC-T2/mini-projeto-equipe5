package com.example.taskmanager.exception;

public class NotFoundException extends AppException {
    public NotFoundException(String resource, Long id) {
        super(404, "NOT_FOUND", resource + " with id " + id + " not found");
    }
}
