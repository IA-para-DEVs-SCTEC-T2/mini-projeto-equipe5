package com.example.taskmanager.repository;

import com.example.taskmanager.domain.entity.WorkLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {
    List<WorkLog> findByTasks_Id(Long taskId);
}
