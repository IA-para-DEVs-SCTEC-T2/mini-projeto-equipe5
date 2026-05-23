package com.example.taskmanager.service;

import com.example.taskmanager.dto.request.CreateEpicRequest;
import com.example.taskmanager.dto.request.UpdateEpicRequest;
import com.example.taskmanager.dto.response.EpicResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface EpicService {
    EpicResponse create(CreateEpicRequest request, Authentication auth);
    EpicResponse update(Long id, UpdateEpicRequest request, Authentication auth);
    void delete(Long id, Authentication auth);
    EpicResponse findById(Long id);
    List<EpicResponse> findByProjectId(Long projectId);
}
