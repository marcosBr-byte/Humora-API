package br.com.projetoSpringBoot.spring_boot.dto;

import jakarta.validation.constraints.NotEmpty;

public record LoginRequestDTO(

        @NotEmpty(message = "Email é obrigatorio") String email,
        @NotEmpty(message = "Senha é obrigatoria") String senha) {
}
