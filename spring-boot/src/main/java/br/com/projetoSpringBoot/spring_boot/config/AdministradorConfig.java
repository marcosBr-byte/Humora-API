package br.com.projetoSpringBoot.spring_boot.config;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Materia;
import br.com.projetoSpringBoot.spring_boot.model.Professor;
import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import br.com.projetoSpringBoot.spring_boot.services.ProfessorService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
public class AdministradorConfig {
    @Bean
    ApplicationRunner prepararAdministrador(
            @Value("${HUMORA_ADMIN_EMAIL:}") String email,
            @Value("${HUMORA_ADMIN_PASSWORD:}") String senha,
            ProfessorService professores, AlunoService alunos, PasswordEncoder encoder) {
        return args -> {
            String emailAdmin = email.strip().toLowerCase(Locale.ROOT);
            if (emailAdmin.isEmpty() || senha.isEmpty() || professores.findProfessorByEmail(emailAdmin).isPresent()) {
                return;
            }
            if (senha.length() < 8 || alunos.findByEmail(emailAdmin).isPresent()) {
                throw new IllegalStateException("Configure um e-mail livre e uma senha de pelo menos oito caracteres para o administrador.");
            }
            professores.create(new Professor(null, "Administrador", emailAdmin, encoder.encode(senha), Materia.INFORMATICA));
        };
    }
}
