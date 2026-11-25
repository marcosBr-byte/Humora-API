package br.com.projetoSpringBoot.spring_boot.repositories;

import br.com.projetoSpringBoot.spring_boot.model.Visitante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitanteRepository extends JpaRepository<Visitante, Long> {}
