import { ProjectConfig, BackendFramework, Database, TestingFramework } from '../types';
import * as fs from 'fs-extra';
import * as path from 'path';

export class JavaTemplates {
    static async generateSpringBoot(config: ProjectConfig, projectPath: string): Promise<void> {
        // Create directories
        const dirs = [
            'src/main/java/com/example/app',
            'src/main/java/com/example/app/controller',
            'src/main/java/com/example/app/service',
            'src/main/java/com/example/app/repository',
            'src/main/java/com/example/app/model',
            'src/main/java/com/example/app/config',
            'src/main/java/com/example/app/exception',
            'src/main/resources',
            'src/test/java/com/example/app',
            'src/test/resources'
        ];

        for (const dir of dirs) {
            await fs.ensureDir(path.join(projectPath, dir));
        }

        // Create files
        const files = [
            {
                path: 'pom.xml',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>${config.name.toLowerCase()}</artifactId>
    <version>${config.version || '1.0.0'}</version>
    <name>${config.name}</name>
    <description>${config.description || 'Spring Boot application'}</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`
            },
            {
                path: 'src/main/java/com/example/app/Application.java',
                content: `package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
`
            },
            {
                path: 'src/main/resources/application.yml',
                content: `spring:
  application:
    name: ${config.name.toLowerCase()}
  
  datasource:
    url: jdbc:mysql://localhost:3306/${config.name.toLowerCase()}_db?useSSL=false&serverTimezone=UTC
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true

server:
  port: 8080

logging:
  level:
    com.example.app: DEBUG
`
            },
            {
                path: 'README.md',
                content: `# ${config.name}

A modern Spring Boot application with comprehensive enterprise features.

## Features

- Spring Boot 3.2
- Spring Data JPA
- MySQL database
- Comprehensive testing
- Maven build system

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Quick Start

1. Configure the database in \`src/main/resources/application.yml\`

2. Build the project:
   \`\`\`bash
   mvn clean install
   \`\`\`

3. Run the application:
   \`\`\`bash
   mvn spring-boot:run
   \`\`\`

4. Access the application:
   - Application: http://localhost:8080

## Testing

Run tests with Maven:
\`\`\`bash
mvn test
\`\`\`
`
            }
        ];

        for (const file of files) {
            const filePath = path.join(projectPath, file.path);
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, file.content, 'utf8');
        }
    }
}
