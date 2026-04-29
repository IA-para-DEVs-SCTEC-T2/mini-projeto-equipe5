package com.example.tasks;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

@Service
public class TaskService {

    private final List<Task> tasks = new ArrayList<>(List.of(
        new Task(1L, "Comprar mantimentos", false),
        new Task(2L, "Estudar Spring Boot", true),
        new Task(3L, "Fazer exercícios", false)
    ));

    private final AtomicLong counter = new AtomicLong(3);

    public List<Task> getAll() {
        return tasks;
    }

    public Task add(Task task) {
        Task newTask = new Task(counter.incrementAndGet(), task.title(), task.completed());
        tasks.add(newTask);
        return newTask;
    }
}
