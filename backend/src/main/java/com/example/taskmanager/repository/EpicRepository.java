package com.example.taskmanager.repository;

import com.example.taskmanager.domain.entity.Epic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EpicRepository extends JpaRepository<Epic, Long> {
    List<Epic> findByProjects_Id(Long projectId);
}
