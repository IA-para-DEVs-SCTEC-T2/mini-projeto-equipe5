package com.example.taskmanager.exception;

public class ForbiddenException extends AppException {
    public ForbiddenException() {
        super(403, "FORBIDDEN", "Insufficient permissions");
    }
}
