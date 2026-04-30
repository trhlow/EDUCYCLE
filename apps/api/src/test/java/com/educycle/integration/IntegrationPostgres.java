package com.educycle.integration;

import org.testcontainers.containers.PostgreSQLContainer;

import java.io.IOException;
import java.net.ServerSocket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

final class IntegrationPostgres {

    private static final String DATABASE = "educycledb";
    private static final String USERNAME = "educycle";
    private static final String PASSWORD = "integration_db_password";

    private final PostgreSQLContainer<?> container;
    private final LocalPostgres local;

    private IntegrationPostgres(PostgreSQLContainer<?> container, LocalPostgres local) {
        this.container = container;
        this.local = local;
    }

    static IntegrationPostgres start() {
        String mode = System.getProperty("educycle.integration.postgres", "auto").trim().toLowerCase(Locale.ROOT);
        PostgreSQLContainer<?> container = new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName(DATABASE)
                .withUsername(USERNAME)
                .withPassword(PASSWORD);
        try {
            container.start();
            return new IntegrationPostgres(container, null);
        } catch (Throwable dockerUnavailable) {
            container.close();
            if ("docker".equals(mode)) {
                throw new IllegalStateException("Cannot start integration PostgreSQL via Docker", dockerUnavailable);
            }
            return new IntegrationPostgres(null, LocalPostgres.start());
        }
    }

    String jdbcUrl() {
        if (container != null) {
            return container.getJdbcUrl();
        }
        return local.jdbcUrl();
    }

    String username() {
        if (container != null) {
            return container.getUsername();
        }
        return USERNAME;
    }

    String password() {
        if (container != null) {
            return container.getPassword();
        }
        return PASSWORD;
    }

    void stop() {
        if (container != null) {
            container.stop();
        }
        if (local != null) {
            local.stop();
        }
    }

    private static final class LocalPostgres {

        private final Path dataDir;
        private final Path binDir;
        private final int port;

        private LocalPostgres(Path dataDir, Path binDir, int port) {
            this.dataDir = dataDir;
            this.binDir = binDir;
            this.port = port;
        }

        static LocalPostgres start() {
            try {
                Path binDir = findPostgresBinDir();
                Path targetDir = Path.of("target").toAbsolutePath().normalize();
                Files.createDirectories(targetDir);
                Path dataDir = Files.createTempDirectory(targetDir, "pg-it-");
                int port = freePort();

                LocalPostgres postgres = new LocalPostgres(dataDir, binDir, port);
                postgres.run(Duration.ofSeconds(30), "initdb", "-A", "trust", "-U", "postgres", "-D", dataDir.toString());
                postgres.run(Duration.ofSeconds(30), "pg_ctl", "-D", dataDir.toString(), "-l",
                        dataDir.resolve("postgres.log").toString(), "-o", "-p " + port + " -h 127.0.0.1",
                        "-w", "-t", "30", "start");
                postgres.run(Duration.ofSeconds(30), "createuser", "-h", "127.0.0.1", "-p", String.valueOf(port),
                        "-U", "postgres", USERNAME);
                postgres.run(Duration.ofSeconds(30), "createdb", "-h", "127.0.0.1", "-p", String.valueOf(port),
                        "-U", "postgres", "-O", USERNAME, DATABASE);

                Runtime.getRuntime().addShutdownHook(new Thread(postgres::stop));
                return postgres;
            } catch (Exception e) {
                throw new IllegalStateException("Cannot start integration PostgreSQL via Docker or local postgres binaries", e);
            }
        }

        String jdbcUrl() {
            return "jdbc:postgresql://127.0.0.1:" + port + "/" + DATABASE;
        }

        void stop() {
            try {
                run(Duration.ofSeconds(15), "pg_ctl", "-D", dataDir.toString(), "-m", "fast", "-w", "stop");
            } catch (Exception ignored) {
                // Best effort cleanup for test shutdown.
            }
        }

        private void run(Duration timeout, String executable, String... args) throws IOException, InterruptedException {
            List<String> command = new ArrayList<>();
            command.add(binDir.resolve(executableName(executable)).toString());
            command.addAll(Arrays.asList(args));

            Process process = new ProcessBuilder(command)
                    .redirectErrorStream(true)
                    .start();
            boolean finished = process.waitFor(timeout.toMillis(), java.util.concurrent.TimeUnit.MILLISECONDS);
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            if (!finished) {
                process.destroyForcibly();
                throw new IllegalStateException("Timed out running " + command);
            }
            if (process.exitValue() != 0) {
                throw new IllegalStateException("Command failed (" + process.exitValue() + "): "
                        + String.join(" ", command) + "\n" + output);
            }
        }

        private static Path findPostgresBinDir() {
            String configured = System.getenv("POSTGRES_BIN");
            if (configured != null && !configured.isBlank()) {
                Path dir = Path.of(configured);
                if (Files.isRegularFile(dir.resolve(executableName("initdb")))) {
                    return dir;
                }
            }

            for (String pathEntry : System.getenv("PATH").split(java.io.File.pathSeparator)) {
                Path dir = Path.of(pathEntry);
                if (Files.isRegularFile(dir.resolve(executableName("initdb")))
                        && Files.isRegularFile(dir.resolve(executableName("pg_ctl")))) {
                    return dir;
                }
            }

            List<Path> commonWindowsDirs = List.of(
                    Path.of("C:\\Program Files\\PostgreSQL\\18\\bin"),
                    Path.of("C:\\Program Files\\PostgreSQL\\17\\bin"),
                    Path.of("C:\\Program Files\\PostgreSQL\\16\\bin")
            );
            for (Path dir : commonWindowsDirs) {
                if (Files.isRegularFile(dir.resolve(executableName("initdb")))
                        && Files.isRegularFile(dir.resolve(executableName("pg_ctl")))) {
                    return dir;
                }
            }

            throw new IllegalStateException("PostgreSQL binaries not found. Start Docker or set POSTGRES_BIN.");
        }

        private static int freePort() throws IOException {
            try (ServerSocket socket = new ServerSocket(0)) {
                socket.setReuseAddress(true);
                return socket.getLocalPort();
            }
        }

        private static String executableName(String baseName) {
            return System.getProperty("os.name").toLowerCase(Locale.ROOT).contains("win")
                    ? baseName + ".exe"
                    : baseName;
        }
    }
}
