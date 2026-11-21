package br.com.projetoSpringBoot.spring_boot.dto;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Emocoes;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;

public record CriarDiarioDTO(@JsonAlias("emocoe") @NotNull Emocoes emocoes) {
}
