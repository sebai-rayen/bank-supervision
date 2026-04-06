package tn.isam.spring.bankSupervision.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    public static final String TOKEN_TYPE = "token_type";
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

    public String generateAccessToken(String username) {
        return buildToken(username, Map.of(TOKEN_TYPE, "ACCESS_TOKEN"), accessTokenExpiration);
    }

    public String generateName(String username) {
        return buildToken(username, Map.of(TOKEN_TYPE, "NAME"), accessTokenExpiration);
    }

    public String generateRefreshToken(String username) {
        return buildToken(username, Map.of(TOKEN_TYPE, "REFRESH_TOKEN"), refreshTokenExpiration);
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

    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(publicKey) // ✅ use parserBuilder + setSigningKey
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

        return generateAccessToken(claims.getSubject());
    }
}