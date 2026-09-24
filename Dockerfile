# ==============================================================================
# Dockerfile for Online Quiz System (Java 17 + Apache Tomcat 9)
# Fixed for Render.com deployment & dynamic $PORT binding
# ==============================================================================

# Stage 1: Build WAR application with Maven & OpenJDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml and source files
COPY pom.xml .
COPY src ./src

# Build WAR package
RUN mvn clean package -DskipTests

# Stage 2: Production runtime with Apache Tomcat 9 on Java 17
FROM tomcat:9.0-jdk17-temurin

# Set default fallback PORT if PORT environment variable is not passed
ENV PORT=8080

# Clear default Tomcat webapps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR file as ROOT.war (serves at /) AND online-quiz-system.war (serves at /online-quiz-system/)
COPY --from=builder /app/target/online-quiz-system.war /usr/local/tomcat/webapps/ROOT.war
COPY --from=builder /app/target/online-quiz-system.war /usr/local/tomcat/webapps/online-quiz-system.war

EXPOSE 8080

# Runtime startup: Replace port="8080" in server.xml with actual runtime $PORT before launching Tomcat
CMD ["sh", "-c", "sed -i \"s/port=\\\"8080\\\"/port=\\\"${PORT:-8080}\\\"/g\" /usr/local/tomcat/conf/server.xml && catalina.sh run"]
