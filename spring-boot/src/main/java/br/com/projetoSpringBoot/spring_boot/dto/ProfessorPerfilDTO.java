package br.com.projetoSpringBoot.spring_boot.dto;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Materia;
import br.com.projetoSpringBoot.spring_boot.model.Professor;

public record ProfessorPerfilDTO(Long id, String nome, String email, Materia materia) {
    public static ProfessorPerfilDTO from(Professor professor) {
        return new ProfessorPerfilDTO(professor.getId(), professor.getNome(), professor.getEmail(), professor.getMateria());
    }
}
