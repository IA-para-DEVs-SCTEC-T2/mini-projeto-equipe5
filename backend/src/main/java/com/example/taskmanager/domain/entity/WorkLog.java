package com.example.taskmanager.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "work_logs")
public class WorkLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @Column(nullable = false)
    private LocalDateTime datetimeStart;

    @Column(nullable = false)
    private LocalDateTime datetimeEnd;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "work_log_tasks",
        joinColumns = @JoinColumn(name = "work_log_id"),
        inverseJoinColumns = @JoinColumn(name = "task_id")
    )
    private Set<Task> tasks = new HashSet<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDatetimeStart() { return datetimeStart; }
    public void setDatetimeStart(LocalDateTime datetimeStart) { this.datetimeStart = datetimeStart; }
    public LocalDateTime getDatetimeEnd() { return datetimeEnd; }
    public void setDatetimeEnd(LocalDateTime datetimeEnd) { this.datetimeEnd = datetimeEnd; }
    public Set<Task> getTasks() { return tasks; }
    public void setTasks(Set<Task> tasks) { this.tasks = tasks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
