package com.example.taskmanager.controller;

import com.example.taskmanager.dto.request.CreateProjectRequest;
import com.example.taskmanager.dto.request.UpdateProjectRequest;
import com.example.taskmanager.dto.response.EpicResponse;
import com.example.taskmanager.dto.response.ProjectResponse;
import com.example.taskmanager.service.EpicService;
import com.example.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final EpicService epicService;

    public ProjectController(ProjectService projectService, EpicService epicService) {
        this.projectService = projectService;
        this.epicService = epicService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> findAll(Authentication auth) {
        return ResponseEntity.ok(projectService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> findById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(projectService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody CreateProjectRequest request,
                                                   Authentication auth) {
        ProjectResponse response = projectService.create(request, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateProjectRequest request,
                                                   Authentication auth) {
        return ResponseEntity.ok(projectService.update(id, request, auth));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        projectService.delete(id, auth);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{projectId}/epics")
    public ResponseEntity<List<EpicResponse>> findEpicsByProjectId(@PathVariable Long projectId,
                                                                    Authentication auth) {
        return ResponseEntity.ok(epicService.findByProjectId(projectId));
    }
}
