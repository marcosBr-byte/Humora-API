package br.com.projetoSpringBoot.spring_boot.config;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
public class TokenConfig {

    private String secret = "my-secret-key";

    public String generateToken(Aluno aluno) {
        System.out.println("=== GERANDO TOKEN ===");
        System.out.println("Aluno ID: " + aluno.getId());
        System.out.println("Aluno Email: " + aluno.getEmail());

        Algorithm algorithm = Algorithm.HMAC256(secret);
        return JWT.create()
                .withClaim("userId", aluno.getId())  // ← Mudou para "userId"
                .withSubject(aluno.getEmail())
                .withExpiresAt(Instant.now().plusSeconds(800000))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public Optional<JWTUserData> validateToken(String token) {
        try {
            System.out.println("=== VALIDANDO TOKEN ===");
            System.out.println("Secret: " + secret);

            Algorithm algorithm = Algorithm.HMAC256(secret);
            DecodedJWT decodedJWT = JWT.require(algorithm).build().verify(token);

            Long userId = decodedJWT.getClaim("userId").asLong();  // ← Agora busca "userId"
            String email = decodedJWT.getSubject();

            System.out.println("UserId extraído: " + userId);
            System.out.println("Email extraído: " + email);

            if (userId != null && email != null) {
                return Optional.of(new JWTUserData(userId, email));
            }

            return Optional.empty();

        } catch (JWTVerificationException ex) {
            System.out.println("❌ Erro ao validar token: " + ex.getMessage());
            return Optional.empty();
        }
    }
}
