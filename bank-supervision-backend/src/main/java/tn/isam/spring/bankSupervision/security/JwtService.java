package tn.isam.spring.bankSupervision.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    public static final String TOKEN_TYPE = "token_type";
    public static final String CLAIM_NAME = "name";
    public static final String CLAIM_EMAIL = "email";

    private final PrivateKey privateKey;
    private final PublicKey publicKey;

    @Value("${app.security.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${app.security.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    public JwtService() throws Exception {
        this.privateKey = KeyUtils.loadPrivateKey("keys.local-only/private_key.pem");
        this.publicKey = KeyUtils.loadPublicKey("keys.local-only/public_key.pem");
    }

    public String generateAccessToken(String username, String name, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(TOKEN_TYPE, "ACCESS_TOKEN");
        claims.put(CLAIM_NAME, name);
        claims.put(CLAIM_EMAIL, email);

        return buildToken(username, claims, accessTokenExpiration);
    }

    public String generateRefreshToken(String username, String name, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(TOKEN_TYPE, "REFRESH_TOKEN");
        claims.put(CLAIM_NAME, name);
        claims.put(CLAIM_EMAIL, email);

        return buildToken(username, claims, refreshTokenExpiration);
    }

    private String buildToken(String username, Map<String, Object> claims, long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(privateKey)
                .compact();
    }

    public boolean isTokenValid(String token, String expectedUsername) {
        String username = extractUsername(token);
        return username.equals(expectedUsername) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractName(String token) {
        return extractClaims(token).get(CLAIM_NAME, String.class);
    }

    public String extractEmail(String token) {
        return extractClaims(token).get(CLAIM_EMAIL, String.class);
    }

    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            throw new RuntimeException("Invalid token", e);
        }
    }

    public String refreshAccessToken(String refreshToken) {
        Claims claims = extractClaims(refreshToken);

        if (!"REFRESH_TOKEN".equals(claims.get(TOKEN_TYPE, String.class))) {
            throw new RuntimeException("Invalid token type");
        }

        if (claims.getExpiration().before(new Date())) {
            throw new RuntimeException("Refresh token expired");
        }

        String username = claims.getSubject();
        String name = claims.get(CLAIM_NAME, String.class);
        String email = claims.get(CLAIM_EMAIL, String.class);

        return generateAccessToken(username, name, email);
    }
}