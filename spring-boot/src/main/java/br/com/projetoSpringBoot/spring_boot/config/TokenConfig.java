package br.com.projetoSpringBoot.spring_boot.config;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.model.Professor;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
public class TokenConfig {

    private String secret = "my-secret-key";

    public String generateToken(Aluno aluno) {

        Algorithm algorithm = Algorithm.HMAC256(secret);
        return JWT.create()
                .withClaim("userId", aluno.getId())
                .withClaim("role", "ROLE_ALUNO")
                .withSubject(aluno.getEmail())
                .withExpiresAt(Instant.now().plusSeconds(800000))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    // Gerar token para PROFESSOR
    public String generateToken(Professor professor) {
        System.out.println("Token sendo feito");
        Algorithm algorithm = Algorithm.HMAC256(secret);
        return JWT.create()
                .withClaim("userId", professor.getId())
                .withClaim("role", "ROLE_PROFESSOR")
                .withSubject(professor.getEmail())
                .withExpiresAt(Instant.now().plusSeconds(800000))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public Optional<JWTUserData> validateToken(String token) {
        try {


            Algorithm algorithm = Algorithm.HMAC256(secret);
            DecodedJWT decodedJWT = JWT.require(algorithm).build().verify(token);

            Long userId = decodedJWT.getClaim("userId").asLong();
            String email = decodedJWT.getSubject();
            String role = decodedJWT.getClaim("role").asString();

            if (userId != null && email != null && role != null) {
                return Optional.of(new JWTUserData(userId, email, role));
            }

            return Optional.empty();

        } catch (JWTVerificationException ex) {
            return Optional.empty();
        }
    }
}