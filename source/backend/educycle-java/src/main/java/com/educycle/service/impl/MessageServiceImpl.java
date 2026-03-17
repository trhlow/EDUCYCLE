package com.educycle.service.impl;

import com.educycle.dto.message.MessageResponse;
import com.educycle.dto.message.SendMessageRequest;
import com.educycle.exception.NotFoundException;
import com.educycle.model.Message;
import com.educycle.model.Transaction;
import com.educycle.model.User;
import com.educycle.repository.MessageRepository;
import com.educycle.repository.TransactionRepository;
import com.educycle.repository.UserRepository;
import com.educycle.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository     messageRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository        userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getByTransactionId(UUID transactionId) {
        return messageRepository.findByTransactionId(transactionId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public MessageResponse send(UUID transactionId, SendMessageRequest request, UUID senderId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Message message = Message.builder()
                .transaction(transaction)
                .sender(sender)
                .content(request.content())
                .build();

        messageRepository.save(message);
        return mapToResponse(message);
    }

    private MessageResponse mapToResponse(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getTransaction().getId(),
                m.getSender().getId(),
                m.getSender().getUsername(),
                m.getContent(),
                m.getCreatedAt()
        );
    }
}
