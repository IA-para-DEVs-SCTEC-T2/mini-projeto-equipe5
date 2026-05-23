package com.example.taskmanager.service;

import com.example.taskmanager.dto.request.CreateTaskRequest;
import com.example.taskmanager.dto.request.UpdateTaskRequest;
import com.example.taskmanager.dto.response.TaskResponse;

import java.util.List;

public interface TaskService {
    TaskResponse create(CreateTaskRequest request);
    TaskResponse update(Long id, UpdateTaskRequest request);
    void delete(Long id);
    TaskResponse findById(Long id);
    List<TaskResponse> findByEpicId(Long epicId);
}
