package br.com.projetoSpringBoot.spring_boot.repositories;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.model.Diario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiarioRepositories extends JpaRepository<Diario,Long> {
    List<Diario> findAllDiarioByAluno(Aluno aluno);

}
