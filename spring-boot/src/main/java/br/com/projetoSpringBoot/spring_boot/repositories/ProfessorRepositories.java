package br.com.projetoSpringBoot.spring_boot.repositories;

import br.com.projetoSpringBoot.spring_boot.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface ProfessorRepositories extends JpaRepository<Professor, Long> {

    Optional<UserDetails> findByEmail(String email);

    Professor findProfessorByEmail(String email);
}
