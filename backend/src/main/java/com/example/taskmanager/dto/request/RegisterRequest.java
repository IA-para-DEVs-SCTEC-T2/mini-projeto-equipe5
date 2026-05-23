package com.example.taskmanager.dto.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank String name,
    @NotBlank String password
) {}
