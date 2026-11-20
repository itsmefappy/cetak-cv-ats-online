-- ATSResume Builder - MySQL 8.0+ schema
-- PostgreSQL conversion: replace AUTO_INCREMENT with GENERATED ALWAYS AS IDENTITY,
-- remove ON UPDATE CURRENT_TIMESTAMP, and use BOOLEAN natively.

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL DEFAULT 'My Resume',
    template VARCHAR(50) NOT NULL DEFAULT 'classic',
    font_family VARCHAR(30) NOT NULL DEFAULT 'arial',
    font_size VARCHAR(20) NOT NULL DEFAULT 'medium',
    full_name VARCHAR(150),
    headline VARCHAR(150),
    email VARCHAR(191),
    phone VARCHAR(50),
    location VARCHAR(120),
    linkedin VARCHAR(255),
    portfolio VARCHAR(255),
    summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resumes_user_id (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS work_experiences (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT UNSIGNED NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    position VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(120),
    start_date VARCHAR(30),
    end_date VARCHAR(30),
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_work_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_work_resume_order (resume_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS educations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT UNSIGNED NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    institution VARCHAR(191) NOT NULL,
    degree VARCHAR(120),
    field_of_study VARCHAR(120),
    start_year VARCHAR(10),
    end_year VARCHAR(10),
    gpa VARCHAR(20),
    achievements TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_education_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_education_resume_order (resume_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS skills (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT UNSIGNED NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'hard',
    skills_text TEXT NOT NULL,
    CONSTRAINT fk_skills_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT UNSIGNED NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    name VARCHAR(191) NOT NULL,
    issuer_or_link VARCHAR(255),
    year VARCHAR(20),
    description TEXT,
    CONSTRAINT fk_projects_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_projects_resume_order (resume_id, sort_order)
) ENGINE=InnoDB;
