package com.educycle.admin.application;

import com.educycle.admin.application.service.impl.AdminServiceImpl;
import com.educycle.admin.application.usecase.AdminStatsUseCase;
import com.educycle.admin.application.usecase.AdminUsersUseCase;
import com.educycle.admin.api.dto.response.AdminUserSummaryResponse;
import com.educycle.shared.dto.common.PageResponse;
import com.educycle.transaction.application.service.TransactionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private AdminStatsUseCase statsUseCase;

    @Mock
    private AdminUsersUseCase usersUseCase;

    @Mock
    private TransactionService transactionService;

    @Test
    @DisplayName("listUsers clamps page size")
    void listUsersClampsPageSize() {
        AdminServiceImpl service = new AdminServiceImpl(statsUseCase, usersUseCase, transactionService);
        given(usersUseCase.listUsers(org.mockito.ArgumentMatchers.any(Pageable.class)))
                .willReturn(new PageResponse<AdminUserSummaryResponse>(List.of(), 0, 100, 0, 0, true, true));

        service.listUsers(0, 500, "desc");

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(usersUseCase).listUsers(captor.capture());
        assertThat(captor.getValue().getPageSize()).isEqualTo(100);
    }
}
