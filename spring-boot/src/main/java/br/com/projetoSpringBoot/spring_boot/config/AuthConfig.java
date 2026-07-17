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
        System.out.println("Carregando auth config");
        System.out.println("Buscando por email "+ email);
        Optional<Aluno> alunoOpt = alunoService.findByEmail(email);
        Optional<Professor> professorOpt = professorService.findProfessorByEmail(email);

        if (alunoOpt.isEmpty() && professorOpt.isEmpty()) {
            System.out.println("Usuario não encontrado");
            throw new UsernameNotFoundException("Usuário não encontrado: " + email);
        } else if (alunoOpt.isPresent()){
            System.out.println("Usuario encontrado como aluno");
        Aluno aluno = alunoOpt.get();
        return aluno;
        } else {
            System.out.println("Usuario encontrado como professor");
            Professor professor = professorOpt.get();
            return professor;
        }
    }
}