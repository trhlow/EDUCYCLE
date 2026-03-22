package com.educycle.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
/**
 * OAuth2 provider configuration — loaded from application.yml
 * under the "oauth" prefix.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "oauth")
public class OAuthProperties {

    private Google google = new Google();
    private Microsoft microsoft = new Microsoft();

    @Getter @Setter
    public static class Google {
        private String clientId;
        private String jwksUri = "https://www.googleapis.com/oauth2/v3/certs";
    }

    @Getter @Setter
    public static class Microsoft {
        private String clientId;
        private String tenantId = "common";
        private String jwksUri;

        public String getJwksUri() {
            if (jwksUri != null && !jwksUri.isBlank()) return jwksUri;
            return "https://login.microsoftonline.com/" + tenantId + "/discovery/v2.0/keys";
        }
    }
}
