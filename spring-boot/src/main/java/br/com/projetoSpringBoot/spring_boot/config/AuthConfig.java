package br.com.projetoSpringBoot.spring_boot.config;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.model.Professor;
import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import br.com.projetoSpringBoot.spring_boot.services.ProfessorService;
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

    @Autowired
    private ProfessorService professorService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println(" Buscando usuário: " + email);

        // Buscar como aluno
        Optional<Aluno> alunoOpt = alunoService.findByEmail(email);
        if (alunoOpt.isPresent()) {
            System.out.println(" Usuário encontrado como ALUNO: " + email);
            return alunoOpt.get();
        }

        // Buscar como professor
        Optional<Professor> professorOpt = professorService.findProfessorByEmail(email);
        if (professorOpt.isPresent()) {
            System.out.println(" Usuário encontrado como PROFESSOR: " + email);
            return professorOpt.get();
        }

        System.out.println("Usuário não encontrado: " + email);
        throw new UsernameNotFoundException("Usuário não encontrado: " + email);
    }
}