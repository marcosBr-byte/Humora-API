package br.com.projetoSpringBoot.spring_boot.dto;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Materia;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfessorDTO {
    private Long id;
    private String nome;
    private String email;
    private String senha;
    private Materia materia;

}
