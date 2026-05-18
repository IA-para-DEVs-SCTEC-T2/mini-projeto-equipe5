package com.example.taskmanager.controller;

import com.example.taskmanager.dto.request.CreateEpicRequest;
import com.example.taskmanager.dto.request.UpdateEpicRequest;
import com.example.taskmanager.dto.response.EpicResponse;
import com.example.taskmanager.service.EpicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/epics")
public class EpicController {

    private final EpicService epicService;

    public EpicController(EpicService epicService) {
        this.epicService = epicService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<EpicResponse> findById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(epicService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EpicResponse> create(@Valid @RequestBody CreateEpicRequest request,
                                                Authentication auth) {
        EpicResponse response = epicService.create(request, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EpicResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody UpdateEpicRequest request,
                                                Authentication auth) {
        return ResponseEntity.ok(epicService.update(id, request, auth));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        epicService.delete(id, auth);
        return ResponseEntity.noContent().build();
    }
}
