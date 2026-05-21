package com.educycle.ai.api;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.constraints.NotNull;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AiChatControllerValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @Test
    @DisplayName("chat request rejects null message elements")
    void chatRequestRejectsNullMessageElements() {
        var request = new AiChatController.ChatRequest(Collections.singletonList(null));

        assertThat(validator.validate(request))
                .anyMatch(violation -> violation.getConstraintDescriptor()
                        .getAnnotation()
                        .annotationType()
                        .equals(NotNull.class));
    }

    @Test
    @DisplayName("chat request rejects empty and oversized message lists")
    void chatRequestRejectsEmptyAndOversizedMessageLists() {
        assertThat(validator.validate(new AiChatController.ChatRequest(List.of()))).isNotEmpty();

        List<AiChatController.MessageDto> messages = new ArrayList<>();
        for (int i = 0; i < 21; i++) {
            messages.add(new AiChatController.MessageDto("user", "hello"));
        }

        assertThat(validator.validate(new AiChatController.ChatRequest(messages))).isNotEmpty();
    }

    @Test
    @DisplayName("chat request accepts valid messages")
    void chatRequestAcceptsValidMessages() {
        var request = new AiChatController.ChatRequest(List.of(
                new AiChatController.MessageDto("user", "Tôi muốn mua sách")));

        assertThat(validator.validate(request)).isEmpty();
    }
}
