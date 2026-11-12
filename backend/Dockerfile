# Multi-stage build for Spring Boot Backend
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and dependency configurations
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and resources
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
