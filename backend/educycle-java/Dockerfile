# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests -Djwt.secret=build-placeholder

# Runtime stage
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Healthcheck + thư mục upload (volume mount)
RUN apk add --no-cache wget \
  && addgroup -S appgroup && adduser -S appuser -G appgroup \
  && mkdir -p /app/data/uploads && chown -R appuser:appgroup /app/data

USER appuser

ENV SPRING_PROFILES_ACTIVE=production
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
