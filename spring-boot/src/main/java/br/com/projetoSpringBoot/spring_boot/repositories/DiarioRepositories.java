package br.com.projetoSpringBoot.spring_boot.repositories;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.model.Diario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DiarioRepositories extends JpaRepository<Diario,Long> {
    Optional<Diario> findByIdAndAlunoId(Long id, Long alunoId);

    List<Diario> findAllDiarioByAluno(Aluno aluno);

}
