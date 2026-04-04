package com.educycle.service;

import com.educycle.dto.bookwanted.BookWantedInquiryMessageResponse;
import com.educycle.dto.bookwanted.BookWantedInquiryResponse;
import com.educycle.dto.bookwanted.BookWantedInquirySummaryResponse;
import com.educycle.dto.message.SendMessageRequest;

import java.util.List;
import java.util.UUID;

public interface BookWantedInquiryService {

    BookWantedInquiryResponse startOrGetInquiry(UUID postId, UUID responderId);

    List<BookWantedInquirySummaryResponse> listInquiriesForPost(UUID postId, UUID requesterId);

    BookWantedInquiryResponse getInquiry(UUID inquiryId, UUID userId);

    List<BookWantedInquiryMessageResponse> listMessages(UUID inquiryId, UUID userId);

    BookWantedInquiryMessageResponse sendMessage(UUID inquiryId, UUID senderId, SendMessageRequest request);
}
