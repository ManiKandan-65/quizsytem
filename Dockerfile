# ==============================================================================
# Dockerfile for Online Quiz System (Java + Apache Tomcat)
# Suitable for free deployment on Render.com, Railway.app, Koyeb, or Fly.io
# ==============================================================================

# Stage 1: Build application with Maven
FROM maven:3.8.6-openjdk-11 AS builder
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build WAR file
RUN mvn clean package -DskipTests

# Stage 2: Serve application with official Apache Tomcat 9
FROM tomcat:9.0-jre11-openjdk-slim

# Remove default Tomcat web applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR file to Tomcat webapps directory as ROOT.war (serves at root domain /)
COPY --from=builder /app/target/online-quiz-system.war /usr/local/tomcat/webapps/ROOT.war

# Expose HTTP Port
EXPOSE 8080

# Start Tomcat Server
CMD ["catalina.sh", "run"]
