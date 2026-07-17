package br.com.projetoSpringBoot.spring_boot.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenConfig tokenConfig;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authorizeHeader = request.getHeader("Authorization");


        if (Strings.isNotEmpty(authorizeHeader) && authorizeHeader.startsWith("Bearer ")) {  // ← Espaço depois de Bearer
            String token = authorizeHeader.substring(7);  // Remove "Bearer "
            Optional<JWTUserData> optUser = tokenConfig.validateToken(token);

            if (optUser.isPresent()) {
                JWTUserData userData = optUser.get();

                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userData, null, userData.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            }
        }
        filterChain.doFilter(request, response);
    }
}