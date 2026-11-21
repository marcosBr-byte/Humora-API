package br.com.projetoSpringBoot.spring_boot.dto;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Emocoes;
import br.com.projetoSpringBoot.spring_boot.model.Diario;

import java.time.LocalDateTime;

public record DiarioDTO(Long id, Emocoes emocoes, LocalDateTime dataExpiracao) {
    public static DiarioDTO from(Diario diario) {
        return new DiarioDTO(diario.getId(), diario.getEmocoes(), diario.getDataExpiracao());
    }
}
