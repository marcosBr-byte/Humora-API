package br.com.projetoSpringBoot.spring_boot.dto;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Serie;
import br.com.projetoSpringBoot.spring_boot.enumeradores.Turma;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AlunoDTO {
    private Long id;
    private String nome;
    private String email;
    private String senha;
    private Turma turma;
    private Serie serie;
}
