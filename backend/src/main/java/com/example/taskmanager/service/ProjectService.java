package com.example.taskmanager.service;

import com.example.taskmanager.dto.request.CreateProjectRequest;
import com.example.taskmanager.dto.request.UpdateProjectRequest;
import com.example.taskmanager.dto.response.ProjectResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ProjectService {
    ProjectResponse create(CreateProjectRequest request, Authentication auth);
    ProjectResponse update(Long id, UpdateProjectRequest request, Authentication auth);
    void delete(Long id, Authentication auth);
    ProjectResponse findById(Long id);
    List<ProjectResponse> findAll();
}
