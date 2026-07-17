package br.com.projetoSpringBoot.spring_boot.repositories;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface AlunoRepositories extends JpaRepository<Aluno, Long> {


    Optional<UserDetails> findByEmail(String email);

    Optional<Aluno> findAlunoByEmail(String email);
}
