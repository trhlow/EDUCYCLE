package com.educycle.media.api.dto.response;

public record UnsplashImageResponse(
        String id,
        String alt,
        String color,
        Urls urls,
        Integer width,
        Integer height,
        Author author,
        Links links
) {
    public record Urls(
            String thumb,
            String small,
            String regular
    ) {}

    public record Author(
            String name,
            String profileUrl
    ) {}

    public record Links(
            String html,
            String downloadLocation
    ) {}
}
