package com.educycle.wishlist.application;

import com.educycle.wishlist.dto.WishlistCardResponse;

import java.util.List;
import java.util.UUID;

public interface WishlistService {

    List<WishlistCardResponse> listMine(UUID userId);

    void add(UUID userId, UUID productId);

    void remove(UUID userId, UUID productId);
}
