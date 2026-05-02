package com.educycle.transaction.application.usecase;

import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.dto.common.PageResponse;
import com.educycle.shared.util.MessageConstants;
import com.educycle.transaction.api.dto.response.TransactionResponse;
import com.educycle.transaction.application.support.TransactionAccessService;
import com.educycle.transaction.application.support.TransactionResponseMapper;
import com.educycle.transaction.domain.TransactionStatus;
import com.educycle.transaction.domain.Transaction;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final TransactionAccessService accessService;

    public TransactionResponse getById(UUID id) {
        return transactionRepository.findByIdWithDetails(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));
    }

    public TransactionResponse getById(UUID id, UUID actorUserId, boolean admin) {
        Transaction transaction = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));
        accessService.assertCanView(transaction, actorUserId, admin);
        return mapper.toResponse(transaction);
    }

    public List<TransactionResponse> getAll() {
        return transactionRepository.findAllWithDetails()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public PageResponse<TransactionResponse> getAll(Pageable pageable) {
        return toPageResponse(transactionRepository.findAllWithDetails(pageable));
    }

    public List<TransactionResponse> getMyTransactions(UUID userId) {
        return transactionRepository.findByUserId(userId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public PageResponse<TransactionResponse> getMyTransactions(UUID userId, Pageable pageable) {
        return toPageResponse(transactionRepository.findByUserId(userId, pageable));
    }

    public List<TransactionResponse> listDisputedTransactions() {
        return transactionRepository.findByStatusWithDetails(TransactionStatus.DISPUTED)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public PageResponse<TransactionResponse> listDisputedTransactions(Pageable pageable) {
        return toPageResponse(transactionRepository.findByStatusWithDetails(TransactionStatus.DISPUTED, pageable));
    }

    private PageResponse<TransactionResponse> toPageResponse(Page<Transaction> page) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper::toResponse).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
