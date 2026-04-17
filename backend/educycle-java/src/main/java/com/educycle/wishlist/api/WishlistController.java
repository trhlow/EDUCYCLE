package com.educycle.wishlist.api;

import com.educycle.wishlist.dto.WishlistCardResponse;
import com.educycle.wishlist.application.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistCardResponse>> list(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(wishlistService.listMine(UUID.fromString(userId)));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> add(
            @AuthenticationPrincipal String userId,
            @PathVariable UUID productId) {
        wishlistService.add(UUID.fromString(userId), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(
            @AuthenticationPrincipal String userId,
            @PathVariable UUID productId) {
        wishlistService.remove(UUID.fromString(userId), productId);
        return ResponseEntity.noContent().build();
    }
}
