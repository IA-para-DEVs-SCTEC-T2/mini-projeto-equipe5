package com.example.taskmanager.repository;

import com.example.taskmanager.domain.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByEpics_Id(Long epicId);
}
