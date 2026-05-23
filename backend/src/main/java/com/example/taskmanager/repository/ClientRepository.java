package com.example.taskmanager.repository;

import com.example.taskmanager.domain.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
}
