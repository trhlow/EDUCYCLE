package com.educycle.service.impl;

import com.educycle.dto.bookwanted.BookWantedInquiryMessageResponse;
import com.educycle.dto.bookwanted.BookWantedInquiryResponse;
import com.educycle.dto.bookwanted.BookWantedInquirySummaryResponse;
import com.educycle.dto.message.SendMessageRequest;
import com.educycle.enums.BookWantedStatus;
import com.educycle.exception.BadRequestException;
import com.educycle.exception.ForbiddenException;
import com.educycle.exception.NotFoundException;
import com.educycle.model.BookWantedInquiry;
import com.educycle.model.BookWantedInquiryMessage;
import com.educycle.model.BookWantedPost;
import com.educycle.model.User;
import com.educycle.repository.BookWantedInquiryMessageRepository;
import com.educycle.repository.BookWantedInquiryRepository;
import com.educycle.repository.BookWantedPostRepository;
import com.educycle.repository.UserRepository;
import com.educycle.service.BookWantedInquiryService;
import com.educycle.service.NotificationService;
import com.educycle.util.MessageConstants;
import com.educycle.util.PrivacyHelper;
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
public class BookWantedInquiryServiceImpl implements BookWantedInquiryService {

    private final BookWantedInquiryRepository        inquiryRepository;
    private final BookWantedInquiryMessageRepository messageRepository;
    private final BookWantedPostRepository         postRepository;
    private final UserRepository                   userRepository;
    private final NotificationService              notificationService;

    @Override
    public BookWantedInquiryResponse startOrGetInquiry(UUID postId, UUID responderId) {
        BookWantedPost post = postRepository.findWithUserById(postId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tin tìm sách"));
        if (post.getUser().getId().equals(responderId)) {
            throw new ForbiddenException(MessageConstants.BOOK_WANTED_CANNOT_CONTACT_SELF);
        }
        if (post.getStatus() != BookWantedStatus.OPEN) {
            throw new BadRequestException(MessageConstants.BOOK_WANTED_POST_NOT_OPEN);
        }
        User responder = userRepository.findById(responderId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));

        BookWantedInquiry inquiry = inquiryRepository.findByPost_IdAndResponder_Id(postId, responderId)
                .orElseGet(() -> {
                    BookWantedInquiry created = BookWantedInquiry.builder()
                            .post(post)
                            .responder(responder)
                            .build();
                    inquiryRepository.save(created);
                    UUID ownerId = post.getUser().getId();
                    notificationService.create(
                            ownerId,
                            "BOOK_WANTED_INQUIRY",
                            "Có người liên hệ về tin tìm sách",
                            "Người dùng " + PrivacyHelper.maskUsername(responder.getUsername())
                                    + " muốn trao đổi về: " + post.getTitle(),
                            created.getId());
                    log.info("Book wanted inquiry {} post={} responder={}", created.getId(), postId, responderId);
                    return created;
                });

        return mapInquiry(inquiry);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookWantedInquirySummaryResponse> listInquiriesForPost(UUID postId, UUID requesterId) {
        BookWantedPost post = postRepository.findWithUserById(postId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tin tìm sách"));
        if (!post.getUser().getId().equals(requesterId)) {
            throw new ForbiddenException("Chỉ chủ tin mới xem được danh sách người liên hệ.");
        }
        return inquiryRepository.findByPost_IdOrderByCreatedAtDesc(postId).stream()
                .map(i -> new BookWantedInquirySummaryResponse(
                        i.getId(),
                        i.getResponder().getId(),
                        PrivacyHelper.maskUsername(i.getResponder().getUsername()),
                        i.getCreatedAt()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookWantedInquiryResponse getInquiry(UUID inquiryId, UUID userId) {
        BookWantedInquiry inquiry = inquiryRepository.findByIdWithDetails(inquiryId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.BOOK_WANTED_INQUIRY_NOT_FOUND));
        assertParticipant(inquiry, userId);
        return mapInquiry(inquiry);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookWantedInquiryMessageResponse> listMessages(UUID inquiryId, UUID userId) {
        BookWantedInquiry inquiry = inquiryRepository.findByIdWithDetails(inquiryId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.BOOK_WANTED_INQUIRY_NOT_FOUND));
        assertParticipant(inquiry, userId);
        return messageRepository.findByInquiry_IdOrderByCreatedAtAsc(inquiryId).stream()
                .map(this::mapMessage)
                .toList();
    }

    @Override
    public BookWantedInquiryMessageResponse sendMessage(UUID inquiryId, UUID senderId, SendMessageRequest request) {
        BookWantedInquiry inquiry = inquiryRepository.findByIdWithDetails(inquiryId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.BOOK_WANTED_INQUIRY_NOT_FOUND));
        assertParticipant(inquiry, senderId);
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));

        BookWantedInquiryMessage msg = BookWantedInquiryMessage.builder()
                .inquiry(inquiry)
                .sender(sender)
                .content(request.content().trim())
                .build();
        messageRepository.save(msg);

        UUID recipientId = inquiry.getPost().getUser().getId().equals(senderId)
                ? inquiry.getResponder().getId()
                : inquiry.getPost().getUser().getId();
        notificationService.create(
                recipientId,
                "NEW_MESSAGE",
                "Tin nhắn tìm sách",
                "Tin nhắn mới về: " + inquiry.getPost().getTitle(),
                inquiryId);

        return mapMessage(msg);
    }

    private static void assertParticipant(BookWantedInquiry inquiry, UUID userId) {
        UUID ownerId = inquiry.getPost().getUser().getId();
        UUID responderId = inquiry.getResponder().getId();
        if (!userId.equals(ownerId) && !userId.equals(responderId)) {
            throw new ForbiddenException(MessageConstants.BOOK_WANTED_INQUIRY_NOT_PARTICIPANT);
        }
    }

    private BookWantedInquiryResponse mapInquiry(BookWantedInquiry i) {
        BookWantedPost p = i.getPost();
        User requester = p.getUser();
        User responder = i.getResponder();
        return new BookWantedInquiryResponse(
                i.getId(),
                p.getId(),
                p.getTitle(),
                requester.getId(),
                PrivacyHelper.maskUsername(requester.getUsername()),
                responder.getId(),
                PrivacyHelper.maskUsername(responder.getUsername()),
                i.getCreatedAt());
    }

    private BookWantedInquiryMessageResponse mapMessage(BookWantedInquiryMessage m) {
        User s = m.getSender();
        return new BookWantedInquiryMessageResponse(
                m.getId(),
                m.getInquiry().getId(),
                s.getId(),
                PrivacyHelper.maskUsername(s.getUsername()),
                m.getContent(),
                m.getCreatedAt());
    }
}
