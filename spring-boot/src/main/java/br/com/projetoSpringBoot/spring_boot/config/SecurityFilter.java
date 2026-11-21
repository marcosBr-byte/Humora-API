package br.com.projetoSpringBoot.spring_boot.config;

import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import br.com.projetoSpringBoot.spring_boot.services.ProfessorService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {
    private final TokenConfig tokenConfig;
    private final AlunoService alunoService;
    private final ProfessorService professorService;

    @Value("${HUMORA_ADMIN_EMAIL:}")
    private String emailAdmin;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            tokenConfig.validateToken(authorization.substring(7)).filter(this::contaAtiva).ifPresent(usuario -> {
                var autoridades = new ArrayList<GrantedAuthority>(usuario.getAuthorities());
                if ("ROLE_PROFESSOR".equals(usuario.getRole()) && usuario.getEmail().equalsIgnoreCase(emailAdmin.strip())) {
                    autoridades.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                }
                var authentication = UsernamePasswordAuthenticationToken.authenticated(
                        usuario, null, autoridades);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }
        filterChain.doFilter(request, response);
    }

    private boolean contaAtiva(JWTUserData usuario) {
        if ("ROLE_ALUNO".equals(usuario.getRole())) {
            return alunoService.findByEmail(usuario.getEmail())
                    .filter(aluno -> aluno.getId().equals(usuario.getUserId()))
                    .isPresent();
        }
        return professorService.findProfessorByEmail(usuario.getEmail())
                .filter(professor -> professor.getId().equals(usuario.getUserId()))
                .isPresent();
    }
}
