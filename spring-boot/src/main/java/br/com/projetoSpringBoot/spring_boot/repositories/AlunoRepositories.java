package br.com.projetoSpringBoot.spring_boot.repositories;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlunoRepositories extends JpaRepository<Aluno, Long> {
}
