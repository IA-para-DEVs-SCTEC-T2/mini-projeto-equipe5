package com.example.taskmanager.service;

import com.example.taskmanager.domain.entity.Epic;
import com.example.taskmanager.domain.entity.Project;
import com.example.taskmanager.dto.request.CreateEpicRequest;
import com.example.taskmanager.dto.request.UpdateEpicRequest;
import com.example.taskmanager.dto.response.ClientResponse;
import com.example.taskmanager.dto.response.EpicResponse;
import com.example.taskmanager.dto.response.ProjectResponse;
import com.example.taskmanager.dto.response.UserResponse;
import com.example.taskmanager.exception.ForbiddenException;
import com.example.taskmanager.exception.NotFoundException;
import com.example.taskmanager.exception.ValidationException;
import com.example.taskmanager.repository.EpicRepository;
import com.example.taskmanager.repository.ProjectRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class EpicServiceImpl implements EpicService {

    private final EpicRepository epicRepository;
    private final ProjectRepository projectRepository;

    public EpicServiceImpl(EpicRepository epicRepository, ProjectRepository projectRepository) {
        this.epicRepository = epicRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    public EpicResponse create(CreateEpicRequest request, Authentication auth) {
        requireSupervisor(auth);
        validateDateRange(request.startDate(), request.endDate());

        Set<Project> projects = resolveProjects(request.projectIds());

        Epic epic = new Epic();
        epic.setTitle(request.title());
        epic.setDescription(request.description());
        epic.setStartDate(request.startDate());
        epic.setEndDate(request.endDate());
        epic.setProjects(projects);

        Epic saved = epicRepository.save(epic);
        return toResponse(saved);
    }

    @Override
    public EpicResponse update(Long id, UpdateEpicRequest request, Authentication auth) {
        requireSupervisor(auth);

        Epic epic = epicRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Epic", id));

        LocalDate startDate = request.startDate() != null ? request.startDate() : epic.getStartDate();
        LocalDate endDate = request.endDate() != null ? request.endDate() : epic.getEndDate();
        validateDateRange(startDate, endDate);

        if (request.title() != null) {
            epic.setTitle(request.title());
        }
        if (request.description() != null) {
            epic.setDescription(request.description());
        }
        if (request.startDate() != null) {
            epic.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            epic.setEndDate(request.endDate());
        }
        if (request.projectIds() != null) {
            epic.setProjects(resolveProjects(request.projectIds()));
        }

        Epic saved = epicRepository.save(epic);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id, Authentication auth) {
        requireSupervisor(auth);

        Epic epic = epicRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Epic", id));

        epicRepository.delete(epic);
    }

    @Override
    @Transactional(readOnly = true)
    public EpicResponse findById(Long id) {
        Epic epic = epicRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Epic", id));
        return toResponse(epic);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EpicResponse> findByProjectId(Long projectId) {
        return epicRepository.findByProjects_Id(projectId).stream()
            .map(this::toResponse)
            .toList();
    }

    private void requireSupervisor(Authentication auth) {
        boolean isSupervisor = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERVISOR"));
        if (!isSupervisor) {
            throw new ForbiddenException();
        }
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && !endDate.isAfter(startDate)) {
            throw new ValidationException("Request validation failed", List.of(
                new ValidationException.FieldError("endDate", "endDate must be after startDate")
            ));
        }
    }

    private Set<Project> resolveProjects(List<Long> ids) {
        Set<Project> projects = new HashSet<>();
        List<Long> missing = new ArrayList<>();

        for (Long id : ids) {
            projectRepository.findById(id).ifPresentOrElse(
                projects::add,
                () -> missing.add(id)
            );
        }

        if (!missing.isEmpty()) {
            throw new ValidationException("Referenced projects not found", List.of(
                new ValidationException.FieldError("projectIds", "Projects not found: " + missing)
            ));
        }

        return projects;
    }

    private ProjectResponse toProjectResponse(Project project) {
        List<ClientResponse> clients = project.getClients().stream()
            .map(c -> new ClientResponse(c.getId(), c.getName(),
                c.getPos().stream()
                    .map(u -> new UserResponse(u.getId(), u.getEmail(), u.getName(), u.getRole().name()))
                    .toList()))
            .toList();

        List<UserResponse> supervisors = project.getSupervisors().stream()
            .map(u -> new UserResponse(u.getId(), u.getEmail(), u.getName(), u.getRole().name()))
            .toList();

        return new ProjectResponse(project.getId(), project.getName(),
            project.getStartDate(), project.getEndDate(), clients, supervisors);
    }

    private EpicResponse toResponse(Epic epic) {
        List<ProjectResponse> projects = epic.getProjects().stream()
            .map(this::toProjectResponse)
            .toList();

        return new EpicResponse(epic.getId(), epic.getTitle(), epic.getDescription(),
            epic.getStartDate(), epic.getEndDate(), projects);
    }
}
