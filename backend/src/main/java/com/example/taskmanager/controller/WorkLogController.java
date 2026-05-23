package com.example.taskmanager.controller;

import com.example.taskmanager.dto.request.CreateWorkLogRequest;
import com.example.taskmanager.dto.request.UpdateWorkLogRequest;
import com.example.taskmanager.dto.response.WorkLogResponse;
import com.example.taskmanager.service.WorkLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WorkLogController {

    private final WorkLogService workLogService;

    public WorkLogController(WorkLogService workLogService) {
        this.workLogService = workLogService;
    }

    @GetMapping("/worklogs/{id}")
    public ResponseEntity<WorkLogResponse> findById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(workLogService.findById(id));
    }

    @PostMapping("/worklogs")
    public ResponseEntity<WorkLogResponse> create(@Valid @RequestBody CreateWorkLogRequest request,
                                                   Authentication auth) {
        WorkLogResponse response = workLogService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/worklogs/{id}")
    public ResponseEntity<WorkLogResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateWorkLogRequest request,
                                                   Authentication auth) {
        return ResponseEntity.ok(workLogService.update(id, request));
    }

    @DeleteMapping("/worklogs/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        workLogService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tasks/{taskId}/worklogs")
    public ResponseEntity<List<WorkLogResponse>> findByTaskId(@PathVariable Long taskId,
                                                              Authentication auth) {
        return ResponseEntity.ok(workLogService.findByTaskId(taskId));
    }
}
