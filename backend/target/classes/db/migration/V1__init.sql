-- Users
CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    name         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role         VARCHAR(50)  NOT NULL DEFAULT 'REGULAR_USER',
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE client_pos (
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    user_id   BIGINT NOT NULL REFERENCES users(id)   ON DELETE RESTRICT,
    PRIMARY KEY (client_id, user_id)
);

-- Projects
CREATE TABLE projects (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    start_date DATE         NOT NULL,
    end_date   DATE         NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE project_clients (
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    client_id  BIGINT NOT NULL REFERENCES clients(id)  ON DELETE RESTRICT,
    PRIMARY KEY (project_id, client_id)
);

CREATE TABLE project_supervisors (
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    user_id    BIGINT NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
    PRIMARY KEY (project_id, user_id)
);

-- Epics
CREATE TABLE epics (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    start_date  DATE         NOT NULL,
    end_date    DATE         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE epic_projects (
    epic_id    BIGINT NOT NULL REFERENCES epics(id)    ON DELETE RESTRICT,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    PRIMARY KEY (epic_id, project_id)
);

-- Tasks
CREATE TABLE tasks (
    id             BIGSERIAL PRIMARY KEY,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    datetime_start TIMESTAMP    NOT NULL,
    datetime_end   TIMESTAMP    NOT NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE task_epics (
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE RESTRICT,
    epic_id BIGINT NOT NULL REFERENCES epics(id) ON DELETE RESTRICT,
    PRIMARY KEY (task_id, epic_id)
);

-- Work Logs
CREATE TABLE work_logs (
    id             BIGSERIAL PRIMARY KEY,
    description    TEXT,
    datetime_start TIMESTAMP NOT NULL,
    datetime_end   TIMESTAMP NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE work_log_tasks (
    work_log_id BIGINT NOT NULL REFERENCES work_logs(id) ON DELETE RESTRICT,
    task_id     BIGINT NOT NULL REFERENCES tasks(id)     ON DELETE RESTRICT,
    PRIMARY KEY (work_log_id, task_id)
);
