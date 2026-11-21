package br.com.projetoSpringBoot.spring_boot.dto;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Serie;
import br.com.projetoSpringBoot.spring_boot.enumeradores.Turma;
import br.com.projetoSpringBoot.spring_boot.model.Aluno;

public record AlunoPerfilDTO(Long id, String nome, String email, Serie serie, Turma turma) {
    public static AlunoPerfilDTO from(Aluno aluno) {
        return new AlunoPerfilDTO(aluno.getId(), aluno.getNome(), aluno.getEmail(), aluno.getSerie(), aluno.getTurma());
    }
}
