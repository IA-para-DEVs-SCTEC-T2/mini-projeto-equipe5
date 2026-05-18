package com.example.taskmanager.service;

import com.example.taskmanager.domain.entity.Epic;
import com.example.taskmanager.domain.entity.Project;
import com.example.taskmanager.domain.entity.Task;
import com.example.taskmanager.dto.request.CreateTaskRequest;
import com.example.taskmanager.dto.request.UpdateTaskRequest;
import com.example.taskmanager.dto.response.*;
import com.example.taskmanager.exception.NotFoundException;
import com.example.taskmanager.exception.ValidationException;
import com.example.taskmanager.repository.EpicRepository;
import com.example.taskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final EpicRepository epicRepository;

    public TaskServiceImpl(TaskRepository taskRepository, EpicRepository epicRepository) {
        this.taskRepository = taskRepository;
        this.epicRepository = epicRepository;
    }

    @Override
    public TaskResponse create(CreateTaskRequest request) {
        validateDateTimeRange(request.datetimeStart(), request.datetimeEnd());

        Set<Epic> epics = resolveEpics(request.epicIds());

        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDatetimeStart(request.datetimeStart());
        task.setDatetimeEnd(request.datetimeEnd());
        task.setEpics(epics);

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    @Override
    public TaskResponse update(Long id, UpdateTaskRequest request) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Task", id));

        LocalDateTime start = request.datetimeStart() != null ? request.datetimeStart() : task.getDatetimeStart();
        LocalDateTime end = request.datetimeEnd() != null ? request.datetimeEnd() : task.getDatetimeEnd();
        validateDateTimeRange(start, end);

        if (request.title() != null) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.datetimeStart() != null) {
            task.setDatetimeStart(request.datetimeStart());
        }
        if (request.datetimeEnd() != null) {
            task.setDatetimeEnd(request.datetimeEnd());
        }
        if (request.epicIds() != null) {
            task.setEpics(resolveEpics(request.epicIds()));
        }

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Task", id));

        taskRepository.delete(task);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse findById(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Task", id));
        return toResponse(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> findByEpicId(Long epicId) {
        return taskRepository.findByEpics_Id(epicId).stream()
            .map(this::toResponse)
            .toList();
    }

    private void validateDateTimeRange(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null && !end.isAfter(start)) {
            throw new ValidationException("Request validation failed", List.of(
                new ValidationException.FieldError("datetimeEnd", "datetimeEnd must be after datetimeStart")
            ));
        }
    }

    private Set<Epic> resolveEpics(List<Long> ids) {
        Set<Epic> epics = new HashSet<>();
        List<Long> missing = new ArrayList<>();

        for (Long id : ids) {
            epicRepository.findById(id).ifPresentOrElse(
                epics::add,
                () -> missing.add(id)
            );
        }

        if (!missing.isEmpty()) {
            throw new ValidationException("Referenced epics not found", List.of(
                new ValidationException.FieldError("epicIds", "Epics not found: " + missing)
            ));
        }

        return epics;
    }

    private EpicResponse toEpicResponse(Epic epic) {
        List<ProjectResponse> projects = epic.getProjects().stream()
            .map(this::toProjectResponse)
            .toList();

        return new EpicResponse(epic.getId(), epic.getTitle(), epic.getDescription(),
            epic.getStartDate(), epic.getEndDate(), projects);
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

    private TaskResponse toResponse(Task task) {
        List<EpicResponse> epics = task.getEpics().stream()
            .map(this::toEpicResponse)
            .toList();

        return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(),
            task.getDatetimeStart(), task.getDatetimeEnd(), epics);
    }
}
