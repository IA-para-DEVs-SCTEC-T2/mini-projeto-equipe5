package com.example.taskmanager.controller;

import com.example.taskmanager.dto.request.CreateTaskRequest;
import com.example.taskmanager.dto.request.UpdateTaskRequest;
import com.example.taskmanager.dto.response.TaskResponse;
import com.example.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<TaskResponse> findById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(taskService.findById(id));
    }

    @PostMapping("/tasks")
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest request,
                                                Authentication auth) {
        TaskResponse response = taskService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<TaskResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody UpdateTaskRequest request,
                                                Authentication auth) {
        return ResponseEntity.ok(taskService.update(id, request));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/epics/{epicId}/tasks")
    public ResponseEntity<List<TaskResponse>> findByEpicId(@PathVariable Long epicId,
                                                            Authentication auth) {
        return ResponseEntity.ok(taskService.findByEpicId(epicId));
    }
}
