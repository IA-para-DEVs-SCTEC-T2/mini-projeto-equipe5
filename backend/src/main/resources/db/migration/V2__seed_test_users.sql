-- Seed test users for development
-- Password for all users: "Test@1234" (BCrypt hash with $2a$ prefix)

INSERT INTO users (email, name, password_hash, role, created_at, updated_at) VALUES
('admin@test.com', 'Admin User', '$2a$10$MUpDnq6JRX6ApDR5ZnkBzOGvH8AwVhljXrQ.E1DcAcRIFtTdDbstu', 'SUPERVISOR', NOW(), NOW()),
('user@test.com', 'Regular User', '$2a$10$MUpDnq6JRX6ApDR5ZnkBzOGvH8AwVhljXrQ.E1DcAcRIFtTdDbstu', 'REGULAR_USER', NOW(), NOW()),
('po@test.com', 'PO User', '$2a$10$MUpDnq6JRX6ApDR5ZnkBzOGvH8AwVhljXrQ.E1DcAcRIFtTdDbstu', 'PO', NOW(), NOW());
