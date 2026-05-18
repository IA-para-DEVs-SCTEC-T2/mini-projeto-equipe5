# Requirements Document

## Introduction

This document defines the requirements for a task management web application that supports a hierarchical work structure: Client → Project → Epic → Task → WorkLog. The system enables teams to organize work across clients and projects, track progress through epics and tasks, and log time spent. Users self-register and are assigned roles that govern their permissions within the system.

## Glossary

- **System**: The task management web application as a whole
- **API**: The RESTful (or GraphQL) backend interface exposed to clients
- **Auth_Service**: The component responsible for user registration, login, and JWT issuance
- **User**: A registered person with a role in the system (regular user, supervisor, or PO)
- **Client**: An organizational entity that sponsors one or more projects
- **Project**: A time-bounded initiative belonging to one or more clients
- **Epic**: A high-level work grouping that spans one or more projects
- **Task**: A unit of work belonging to one or more epics
- **WorkLog**: A time entry recording work performed on one or more tasks
- **PO (Product Owner)**: A user role representing the client-side product owner
- **Supervisor**: A user role with oversight responsibilities over a project
- **JWT**: JSON Web Token used for stateless authentication
- **ISO 8601**: International standard for date and time representation (e.g., `2024-01-15T09:00:00Z`)

---

## Requirements

### Requirement 1: User Self-Registration

**User Story:** As a visitor, I want to register an account, so that I can access the system and be assigned to projects and tasks.

#### Acceptance Criteria

1. THE Auth_Service SHALL provide a registration endpoint that accepts a unique email address, a display name, and a password.
2. WHEN a registration request is received with a valid, unique email and a password of at least 8 characters, THE Auth_Service SHALL create a new User account with the role "regular user" and return a success response.
3. IF a registration request is received with an email address already associated with an existing account, THEN THE Auth_Service SHALL return a 409 Conflict error with a descriptive message.
4. IF a registration request is received with a password shorter than 8 characters, THEN THE Auth_Service SHALL return a 422 Unprocessable Entity error identifying the invalid field.
5. THE Auth_Service SHALL store passwords using a one-way cryptographic hash and SHALL NOT store plaintext passwords.

---

### Requirement 2: User Authentication

**User Story:** As a registered user, I want to log in with my credentials, so that I can receive a token to access protected resources.

#### Acceptance Criteria

1. WHEN a login request is received with a valid email and matching password, THE Auth_Service SHALL return a signed JWT with an expiry of no more than 24 hours.
2. IF a login request is received with an email that does not match any registered account, THEN THE Auth_Service SHALL return a 401 Unauthorized error.
3. IF a login request is received with a correct email but an incorrect password, THEN THE Auth_Service SHALL return a 401 Unauthorized error.
4. WHEN a request is received on a protected endpoint without a valid JWT in the Authorization header, THE API SHALL return a 401 Unauthorized error.
5. WHEN a request is received on a protected endpoint with an expired JWT, THE API SHALL return a 401 Unauthorized error.

---

### Requirement 3: Role Management

**User Story:** As a supervisor, I want to assign roles to users within a project context, so that responsibilities and permissions are clearly defined.

#### Acceptance Criteria

1. THE System SHALL support exactly three user roles: "regular user", "supervisor", and "PO".
2. WHEN a User is created via self-registration, THE Auth_Service SHALL assign the role "regular user" by default.
3. WHEN a User is designated as a Supervisor of a Project, THE System SHALL record that User as a Supervisor in the context of that Project.
4. WHEN a User is designated as a PO of a Client, THE System SHALL record that User as a PO in the context of that Client.
5. WHILE a User holds the "supervisor" role on a Project, THE System SHALL permit that User to manage Epics, Tasks, and WorkLogs within that Project.
6. IF a User without the "supervisor" role attempts to modify a Project's configuration, THEN THE API SHALL return a 403 Forbidden error.

---

### Requirement 4: Client Management

**User Story:** As a supervisor, I want to create and manage clients, so that projects can be associated with the organizations that commission them.

#### Acceptance Criteria

1. THE System SHALL allow a User with the "supervisor" role to create a Client with a name and an optional list of PO User references.
2. WHEN a Client is created with a valid name, THE System SHALL persist the Client and return its generated identifier.
3. WHEN a Client is updated, THE System SHALL replace the Client's PO list with the provided list of valid User references.
4. IF a Client creation or update request references a User identifier that does not exist, THEN THE API SHALL return a 422 Unprocessable Entity error identifying the invalid reference.
5. THE System SHALL allow a User with the "supervisor" role to retrieve a list of all Clients.

---

### Requirement 5: Project Management

**User Story:** As a supervisor, I want to create and manage projects, so that work can be organized within a defined scope and timeline.

#### Acceptance Criteria

1. THE System SHALL allow a User with the "supervisor" role to create a Project with a name, a start date, an end date, a list of Supervisor User references, and a list of Client references (1 to N).
2. WHEN a Project is created with valid data, THE System SHALL persist the Project and return its generated identifier.
3. THE System SHALL store Project start and end dates in ISO 8601 format.
4. IF a Project creation or update request specifies an end date that precedes the start date, THEN THE API SHALL return a 422 Unprocessable Entity error.
5. IF a Project creation or update request references a Client identifier that does not exist, THEN THE API SHALL return a 422 Unprocessable Entity error identifying the invalid reference.
6. WHEN a Project is updated, THE System SHALL replace the Supervisor list and Client list with the provided valid references.
7. THE System SHALL allow any authenticated User to retrieve a list of Projects.

---

### Requirement 6: Epic Management

**User Story:** As a supervisor, I want to create and manage epics, so that large bodies of work can be grouped and tracked across projects.

#### Acceptance Criteria

1. THE System SHALL allow a User with the "supervisor" role to create an Epic with a title, a description, a start date, an end date, and a list of Project references (1 to N).
2. WHEN an Epic is created with valid data, THE System SHALL persist the Epic and return its generated identifier.
3. THE System SHALL store Epic start and end dates in ISO 8601 format.
4. IF an Epic creation or update request specifies an end date that precedes the start date, THEN THE API SHALL return a 422 Unprocessable Entity error.
5. IF an Epic creation or update request references a Project identifier that does not exist, THEN THE API SHALL return a 422 Unprocessable Entity error identifying the invalid reference.
6. THE System SHALL allow any authenticated User to retrieve Epics associated with a given Project.

---

### Requirement 7: Task Management

**User Story:** As a regular user, I want to create and manage tasks, so that individual units of work can be tracked within epics.

#### Acceptance Criteria

1. THE System SHALL allow any authenticated User to create a Task with a title, a description, a datetime start, a datetime end, and a list of Epic references (1 to N).
2. WHEN a Task is created with valid data, THE System SHALL persist the Task and return its generated identifier.
3. THE System SHALL store Task datetime start and datetime end values in ISO 8601 format.
4. IF a Task creation or update request specifies a datetime end that precedes the datetime start, THEN THE API SHALL return a 422 Unprocessable Entity error.
5. IF a Task creation or update request references an Epic identifier that does not exist, THEN THE API SHALL return a 422 Unprocessable Entity error identifying the invalid reference.
6. THE System SHALL allow any authenticated User to retrieve Tasks associated with a given Epic.

---

### Requirement 8: WorkLog Management

**User Story:** As a regular user, I want to log work entries against tasks, so that time spent can be recorded and reviewed.

#### Acceptance Criteria

1. THE System SHALL allow any authenticated User to create a WorkLog with a description, a datetime start, a datetime end, and a list of Task references (1 to N).
2. WHEN a WorkLog is created with valid data, THE System SHALL persist the WorkLog and return its generated identifier.
3. THE System SHALL store WorkLog datetime start and datetime end values in ISO 8601 format.
4. IF a WorkLog creation or update request specifies a datetime end that precedes the datetime start, THEN THE API SHALL return a 422 Unprocessable Entity error.
5. IF a WorkLog creation or update request references a Task identifier that does not exist, THEN THE API SHALL return a 422 Unprocessable Entity error identifying the invalid reference.
6. THE System SHALL allow any authenticated User to retrieve WorkLogs associated with a given Task.

---

### Requirement 9: Hierarchical Data Retrieval

**User Story:** As a user, I want to navigate the full hierarchy from client down to work logs, so that I can understand the complete picture of work being done.

#### Acceptance Criteria

1. THE API SHALL provide an endpoint to retrieve a Project with its associated Clients and Supervisors.
2. THE API SHALL provide an endpoint to retrieve all Epics belonging to a specified Project.
3. THE API SHALL provide an endpoint to retrieve all Tasks belonging to a specified Epic.
4. THE API SHALL provide an endpoint to retrieve all WorkLogs belonging to a specified Task.
5. WHEN a hierarchy retrieval request references an identifier that does not exist, THE API SHALL return a 404 Not Found error.

---

### Requirement 10: API-First Design and Data Integrity

**User Story:** As a developer integrating with the system, I want a consistent and well-structured API, so that I can build reliable client applications.

#### Acceptance Criteria

1. THE API SHALL expose all resources using consistent URL patterns following REST conventions.
2. THE API SHALL return all responses in JSON format with a Content-Type of `application/json`.
3. WHEN any request body fails schema validation, THE API SHALL return a 400 Bad Request or 422 Unprocessable Entity error with a body that identifies each invalid field and the reason for rejection.
4. THE System SHALL enforce referential integrity such that deleting a Client, Project, Epic, or Task that is referenced by a child entity returns a 409 Conflict error.
5. THE API SHALL include an OpenAPI specification document describing all endpoints, request schemas, and response schemas.
