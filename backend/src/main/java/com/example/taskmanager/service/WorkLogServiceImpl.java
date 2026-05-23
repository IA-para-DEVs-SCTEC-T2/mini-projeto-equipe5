package com.example.taskmanager.service;

import com.example.taskmanager.domain.entity.*;
import com.example.taskmanager.dto.request.CreateWorkLogRequest;
import com.example.taskmanager.dto.request.UpdateWorkLogRequest;
import com.example.taskmanager.dto.response.*;
import com.example.taskmanager.exception.NotFoundException;
import com.example.taskmanager.exception.ValidationException;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.repository.WorkLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class WorkLogServiceImpl implements WorkLogService {

    private final WorkLogRepository workLogRepository;
    private final TaskRepository taskRepository;

    public WorkLogServiceImpl(WorkLogRepository workLogRepository, TaskRepository taskRepository) {
        this.workLogRepository = workLogRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public WorkLogResponse create(CreateWorkLogRequest request) {
        validateDateTimeRange(request.datetimeStart(), request.datetimeEnd());

        Set<Task> tasks = resolveTasks(request.taskIds());

        WorkLog workLog = new WorkLog();
        workLog.setDescription(request.description());
        workLog.setDatetimeStart(request.datetimeStart());
        workLog.setDatetimeEnd(request.datetimeEnd());
        workLog.setTasks(tasks);

        WorkLog saved = workLogRepository.save(workLog);
        return toResponse(saved);
    }

    @Override
    public WorkLogResponse update(Long id, UpdateWorkLogRequest request) {
        WorkLog workLog = workLogRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("WorkLog", id));

        LocalDateTime start = request.datetimeStart() != null ? request.datetimeStart() : workLog.getDatetimeStart();
        LocalDateTime end = request.datetimeEnd() != null ? request.datetimeEnd() : workLog.getDatetimeEnd();
        validateDateTimeRange(start, end);

        if (request.description() != null) {
            workLog.setDescription(request.description());
        }
        if (request.datetimeStart() != null) {
            workLog.setDatetimeStart(request.datetimeStart());
        }
        if (request.datetimeEnd() != null) {
            workLog.setDatetimeEnd(request.datetimeEnd());
        }
        if (request.taskIds() != null) {
            workLog.setTasks(resolveTasks(request.taskIds()));
        }

        WorkLog saved = workLogRepository.save(workLog);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        WorkLog workLog = workLogRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("WorkLog", id));

        workLogRepository.delete(workLog);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkLogResponse findById(Long id) {
        WorkLog workLog = workLogRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("WorkLog", id));
        return toResponse(workLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkLogResponse> findByTaskId(Long taskId) {
        return workLogRepository.findByTasks_Id(taskId).stream()
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

    private Set<Task> resolveTasks(List<Long> ids) {
        Set<Task> tasks = new HashSet<>();
        List<Long> missing = new ArrayList<>();

        for (Long id : ids) {
            taskRepository.findById(id).ifPresentOrElse(
                tasks::add,
                () -> missing.add(id)
            );
        }

        if (!missing.isEmpty()) {
            throw new ValidationException("Referenced tasks not found", List.of(
                new ValidationException.FieldError("taskIds", "Tasks not found: " + missing)
            ));
        }

        return tasks;
    }

    private TaskResponse toTaskResponse(Task task) {
        List<EpicResponse> epics = task.getEpics().stream()
            .map(this::toEpicResponse)
            .toList();

        return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(),
            task.getDatetimeStart(), task.getDatetimeEnd(), epics);
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

    private WorkLogResponse toResponse(WorkLog workLog) {
        List<TaskResponse> tasks = workLog.getTasks().stream()
            .map(this::toTaskResponse)
            .toList();

        return new WorkLogResponse(workLog.getId(), workLog.getDescription(),
            workLog.getDatetimeStart(), workLog.getDatetimeEnd(), tasks);
    }
}
