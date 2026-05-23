package com.example.taskmanager.service;

import com.example.taskmanager.domain.entity.Client;
import com.example.taskmanager.domain.entity.Project;
import com.example.taskmanager.domain.entity.User;
import com.example.taskmanager.dto.request.CreateProjectRequest;
import com.example.taskmanager.dto.request.UpdateProjectRequest;
import com.example.taskmanager.dto.response.ClientResponse;
import com.example.taskmanager.dto.response.ProjectResponse;
import com.example.taskmanager.dto.response.UserResponse;
import com.example.taskmanager.exception.ForbiddenException;
import com.example.taskmanager.exception.NotFoundException;
import com.example.taskmanager.exception.ValidationException;
import com.example.taskmanager.repository.ClientRepository;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.repository.UserRepository;
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
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository,
                              ClientRepository clientRepository,
                              UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ProjectResponse create(CreateProjectRequest request, Authentication auth) {
        requireSupervisor(auth);
        validateDateRange(request.startDate(), request.endDate());

        Set<Client> clients = resolveClients(request.clientIds());
        Set<User> supervisors = resolveUsers(request.supervisorUserIds() != null ? request.supervisorUserIds() : List.of());

        Project project = new Project();
        project.setName(request.name());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        project.setClients(clients);
        project.setSupervisors(supervisors);

        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    @Override
    public ProjectResponse update(Long id, UpdateProjectRequest request, Authentication auth) {
        requireSupervisor(auth);

        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Project", id));

        if (request.name() != null) {
            project.setName(request.name());
        }

        LocalDate startDate = request.startDate() != null ? request.startDate() : project.getStartDate();
        LocalDate endDate = request.endDate() != null ? request.endDate() : project.getEndDate();
        validateDateRange(startDate, endDate);

        if (request.startDate() != null) {
            project.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            project.setEndDate(request.endDate());
        }

        if (request.clientIds() != null) {
            project.setClients(resolveClients(request.clientIds()));
        }
        if (request.supervisorUserIds() != null) {
            project.setSupervisors(resolveUsers(request.supervisorUserIds()));
        }

        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id, Authentication auth) {
        requireSupervisor(auth);

        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Project", id));

        projectRepository.delete(project);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse findById(Long id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Project", id));
        return toResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> findAll() {
        return projectRepository.findAll().stream()
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

    private Set<Client> resolveClients(List<Long> ids) {
        Set<Client> clients = new HashSet<>();
        List<Long> missing = new ArrayList<>();

        for (Long id : ids) {
            clientRepository.findById(id).ifPresentOrElse(
                clients::add,
                () -> missing.add(id)
            );
        }

        if (!missing.isEmpty()) {
            throw new ValidationException("Referenced clients not found", List.of(
                new ValidationException.FieldError("clientIds", "Clients not found: " + missing)
            ));
        }

        return clients;
    }

    private Set<User> resolveUsers(List<Long> ids) {
        Set<User> users = new HashSet<>();
        List<Long> missing = new ArrayList<>();

        for (Long id : ids) {
            userRepository.findById(id).ifPresentOrElse(
                users::add,
                () -> missing.add(id)
            );
        }

        if (!missing.isEmpty()) {
            throw new ValidationException("Referenced users not found", List.of(
                new ValidationException.FieldError("supervisorUserIds", "Users not found: " + missing)
            ));
        }

        return users;
    }

    private ProjectResponse toResponse(Project project) {
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
}
