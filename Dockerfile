# Build Stage
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml settings.xml ./
COPY src ./src
RUN mvn -s settings.xml clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

# Tuned JVM parameters for free-tier 512MB RAM constraints (prevents OOM crashes)
ENTRYPOINT ["sh", "-c", "java -XX:+UseSerialGC -Xmx350m -Xss512k -Dserver.port=${PORT:-8080} -jar app.jar"]
