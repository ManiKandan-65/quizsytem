# ==============================================================================
# Dockerfile for Online Quiz System (Java 17 + Apache Tomcat 9)
# Optimized for Render.com, Railway, Koyeb & Fly.io
# ==============================================================================

# Stage 1: Build WAR application with Maven & OpenJDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build WAR package
RUN mvn clean package -DskipTests

# Stage 2: Production runtime with Apache Tomcat 9 on Java 17 (Eclipse Temurin - fixes cgroups v2 bug)
FROM tomcat:9.0-jdk17-temurin

# Set default fallback HTTP port to 8080 if PORT environment variable is not passed
ENV PORT=8080

# Dynamically bind Tomcat HTTP port to Render's $PORT environment variable
RUN sed -i 's/port="8080"/port="${env.PORT}"/g' /usr/local/tomcat/conf/server.xml

# Remove default Tomcat sample web applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy compiled WAR file as ROOT.war (serves application directly at root path /)
COPY --from=builder /app/target/online-quiz-system.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080

# Start Tomcat Server
CMD ["catalina.sh", "run"]
