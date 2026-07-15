package br.com.projetoSpringBoot.spring_boot.repositories;

import br.com.projetoSpringBoot.spring_boot.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepositories extends JpaRepository<Professor, Long> {
}
