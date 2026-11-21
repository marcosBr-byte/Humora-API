package br.com.projetoSpringBoot.spring_boot.config;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.model.Professor;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Component
public class TokenConfig {
    private static final String ISSUER = "humora";

    private final Algorithm algorithm;
    private final JWTVerifier verifier;

    public TokenConfig(@Value("${HUMORA_JWT_SECRET:}") String secret) {
        byte[] key = secret.getBytes(StandardCharsets.UTF_8);
        if (secret.isBlank()) {
            key = new byte[32];
            new SecureRandom().nextBytes(key);
        } else if (key.length < 32) {
            throw new IllegalArgumentException("HUMORA_JWT_SECRET deve ter pelo menos 32 bytes");
        }
        this.algorithm = Algorithm.HMAC256(key);
        this.verifier = JWT.require(algorithm).withIssuer(ISSUER)
                .withClaimPresence("exp").withClaimPresence("iat").build();
    }

    public String generateToken(Aluno aluno) {
        return generateToken(aluno.getId(), aluno.getEmail(), "ROLE_ALUNO");
    }

    public String generateToken(Professor professor) {
        return generateToken(professor.getId(), professor.getEmail(), "ROLE_PROFESSOR");
    }

    private String generateToken(Long id, String email, String role) {
        Instant agora = Instant.now();
        return JWT.create()
                .withIssuer(ISSUER)
                .withClaim("userId", id)
                .withClaim("role", role)
                .withSubject(email)
                .withExpiresAt(agora.plus(2, ChronoUnit.HOURS))
                .withIssuedAt(agora)
                .sign(algorithm);
    }

    public Optional<JWTUserData> validateToken(String token) {
        try {
            var jwt = verifier.verify(token);
            Long userId = jwt.getClaim("userId").asLong();
            String email = jwt.getSubject();
            String role = jwt.getClaim("role").asString();
            if (userId == null || email == null || email.isBlank()
                    || !("ROLE_ALUNO".equals(role) || "ROLE_PROFESSOR".equals(role))) {
                return Optional.empty();
            }
            return Optional.of(new JWTUserData(userId, email, role));
        } catch (JWTVerificationException ex) {
            return Optional.empty();
        }
    }
}
