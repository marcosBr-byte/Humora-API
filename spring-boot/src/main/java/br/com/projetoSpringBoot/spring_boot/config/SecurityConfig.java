package br.com.projetoSpringBoot.spring_boot.config;

import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(authorize -> authorize

                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()

                        // =========================
                        // FRONTEND
                        // =========================

                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/login.html",
                                "/aluno.html",
                                "/professor.html",
                                "/cadastroAluno.html",
                                "/cadastroVisitante.html",
                                "/visitante.html",
                                "/cadastroProfessor.html",
                                "/css/**",
                                "/js/**",
                                "/imagens/**",
                                "/images/**",
                                "/favicon.ico"
                        ).permitAll()

                        // =========================
                        // SWAGGER
                        // =========================

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // =========================
                        // AUTENTICAÇÃO
                        // =========================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/auth/login/aluno"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/auth/login/professor"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/auth/register/aluno"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/fect/registros"
                        ).permitAll()

                        .requestMatchers(HttpMethod.GET, "/fect/ao-vivo").permitAll()

                        .requestMatchers(HttpMethod.POST, "/auth/register/professor").hasRole("ADMIN")

                        // =========================
                        // ÁREA DO ALUNO
                        // =========================

                        .requestMatchers("/aluno/**")
                        .hasRole("ALUNO")

                        // =========================
                        // ÁREA DO PROFESSOR
                        // =========================

                        .requestMatchers("/professor/**")
                        .hasRole("PROFESSOR")

                        // =========================
                        // RESTANTE DA API
                        // =========================

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        securityFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration)
            throws Exception {

        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}