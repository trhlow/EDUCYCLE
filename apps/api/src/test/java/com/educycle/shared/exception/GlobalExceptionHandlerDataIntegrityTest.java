package com.educycle.shared.exception;

import com.educycle.shared.response.ApiErrorBody;
import com.educycle.shared.util.MessageConstants;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerDataIntegrityTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void mapsEmailConflict_fromHibernateConstraintName() {
        SQLException sql = new SQLException("duplicate");
        ConstraintViolationException cause = new ConstraintViolationException("duplicate key", sql, "uq_users_email");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("wrap", cause);

        ResponseEntity<ApiErrorBody> res = handler.handleDataIntegrity(ex);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().message()).isEqualTo(MessageConstants.EMAIL_ALREADY_EXISTS);
    }

    @Test
    void mapsUsernameConflict_fromHibernateConstraintName() {
        SQLException sql = new SQLException("duplicate");
        ConstraintViolationException cause = new ConstraintViolationException("duplicate key", sql, "uq_users_username");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("wrap", cause);

        ResponseEntity<ApiErrorBody> res = handler.handleDataIntegrity(ex);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().message()).isEqualTo(MessageConstants.USERNAME_TAKEN);
    }

    @Test
    void fallsBackToSqlMessage_whenConstraintNameAbsent() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("wrap",
                new SQLException("ERROR: duplicate key value violates unique constraint \"uq_users_email\""));

        ResponseEntity<ApiErrorBody> res = handler.handleDataIntegrity(ex);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().message()).isEqualTo(MessageConstants.EMAIL_ALREADY_EXISTS);
    }
}
