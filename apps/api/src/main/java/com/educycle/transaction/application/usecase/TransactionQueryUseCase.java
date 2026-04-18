package com.educycle.transaction.application.usecase;

import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.transaction.api.dto.response.TransactionResponse;
import com.educycle.transaction.application.support.TransactionResponseMapper;
import com.educycle.transaction.domain.TransactionStatus;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionQueryUseCase {

    private final TransactionRepository transactionRepository;
    private final TransactionResponseMapper mapper;

    public TransactionResponse getById(UUID id) {
        return transactionRepository.findByIdWithDetails(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));
    }

    public List<TransactionResponse> getAll() {
        return transactionRepository.findAllWithDetails()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<TransactionResponse> getMyTransactions(UUID userId) {
        return transactionRepository.findByUserId(userId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<TransactionResponse> listDisputedTransactions() {
        return transactionRepository.findByStatusWithDetails(TransactionStatus.DISPUTED)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }
}
