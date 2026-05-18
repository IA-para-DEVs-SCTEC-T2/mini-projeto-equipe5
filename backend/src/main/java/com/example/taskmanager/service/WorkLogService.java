package com.example.taskmanager.service;

import com.example.taskmanager.dto.request.CreateWorkLogRequest;
import com.example.taskmanager.dto.request.UpdateWorkLogRequest;
import com.example.taskmanager.dto.response.WorkLogResponse;

import java.util.List;

public interface WorkLogService {
    WorkLogResponse create(CreateWorkLogRequest request);
    WorkLogResponse update(Long id, UpdateWorkLogRequest request);
    void delete(Long id);
    WorkLogResponse findById(Long id);
    List<WorkLogResponse> findByTaskId(Long taskId);
}
