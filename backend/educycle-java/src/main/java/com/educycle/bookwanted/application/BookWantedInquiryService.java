package com.educycle.bookwanted.application;

import com.educycle.bookwanted.dto.BookWantedInquiryMessageResponse;
import com.educycle.bookwanted.dto.BookWantedInquiryResponse;
import com.educycle.bookwanted.dto.BookWantedInquirySummaryResponse;
import com.educycle.transaction.dto.message.SendMessageRequest;

import java.util.List;
import java.util.UUID;

public interface BookWantedInquiryService {

    BookWantedInquiryResponse startOrGetInquiry(UUID postId, UUID responderId);

    List<BookWantedInquirySummaryResponse> listInquiriesForPost(UUID postId, UUID requesterId);

    BookWantedInquiryResponse getInquiry(UUID inquiryId, UUID userId);

    List<BookWantedInquiryMessageResponse> listMessages(UUID inquiryId, UUID userId);

    BookWantedInquiryMessageResponse sendMessage(UUID inquiryId, UUID senderId, SendMessageRequest request);
}
