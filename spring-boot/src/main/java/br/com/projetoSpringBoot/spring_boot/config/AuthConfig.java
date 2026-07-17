package br.com.projetoSpringBoot.spring_boot.config;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthConfig implements UserDetailsService {

    @Autowired
    private AlunoService alunoService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("=== LOAD USER BY USERNAME ===");
        System.out.println("Buscando usuário com email: " + email);

        Optional<Aluno> alunoOpt = alunoService.findByEmail(email);

        if (alunoOpt.isEmpty()) {
            System.out.println("❌ Usuário não encontrado!");
            throw new UsernameNotFoundException("Usuário não encontrado: " + email);
        }

        Aluno aluno = alunoOpt.get();
        System.out.println("✅ Usuário encontrado: " + aluno.getEmail());

        return aluno;
    }
}