package com.example.taskmanager.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private LocalDateTime datetimeStart;

    @Column(nullable = false)
    private LocalDateTime datetimeEnd;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "task_epics",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "epic_id")
    )
    private Set<Epic> epics = new HashSet<>();

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
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDatetimeStart() { return datetimeStart; }
    public void setDatetimeStart(LocalDateTime datetimeStart) { this.datetimeStart = datetimeStart; }
    public LocalDateTime getDatetimeEnd() { return datetimeEnd; }
    public void setDatetimeEnd(LocalDateTime datetimeEnd) { this.datetimeEnd = datetimeEnd; }
    public Set<Epic> getEpics() { return epics; }
    public void setEpics(Set<Epic> epics) { this.epics = epics; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
