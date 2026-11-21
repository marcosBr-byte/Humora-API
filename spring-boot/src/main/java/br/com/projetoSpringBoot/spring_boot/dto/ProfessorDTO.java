package br.com.projetoSpringBoot.spring_boot.dto;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Materia;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfessorDTO {
    @NotEmpty(message = "Nome é obrigatorio")
    private String nome;

    @NotEmpty(message = "Email é obrigatorio")
    private String email;

    @NotEmpty(message = "Senha é obrigatorio")
    @Size(min = 8, message = "A senha deve conter no minimo 8 caracteres")
    private String senha;

    @NotNull(message = "Materia não pode ser vazia")
    private Materia materia;

}
