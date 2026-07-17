package br.com.projetoSpringBoot.spring_boot.repositories;

import br.com.projetoSpringBoot.spring_boot.model.Diario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiarioRepositories extends JpaRepository<Diario,Long> {


}
