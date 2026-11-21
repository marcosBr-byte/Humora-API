package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.config.JWTUserData;
import br.com.projetoSpringBoot.spring_boot.dto.AlunoPerfilDTO;
import br.com.projetoSpringBoot.spring_boot.dto.ProfessorPerfilDTO;
import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import br.com.projetoSpringBoot.spring_boot.services.ProfessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/professor")
public class ProfessorController {
    private final ProfessorService professorService;
    private final AlunoService alunoService;

    @GetMapping("/me")
    public ProfessorPerfilDTO perfil(@AuthenticationPrincipal JWTUserData usuario) {
        return ProfessorPerfilDTO.from(professorService.findById(usuario.getUserId()));
    }

    @GetMapping("/permissoes")
    public Map<String, Boolean> permissoes(Authentication autenticacao) {
        return Map.of("administrador", autenticacao.getAuthorities().stream()
                .anyMatch(autoridade -> "ROLE_ADMIN".equals(autoridade.getAuthority())));
    }

    @GetMapping("/alunos")
    public List<AlunoPerfilDTO> listarAlunos() {
        return alunoService.findAll().stream().map(AlunoPerfilDTO::from).toList();
    }

    @GetMapping("/{id}")
    public ProfessorPerfilDTO consultar(@AuthenticationPrincipal JWTUserData usuario, @PathVariable Long id) {
        if (!usuario.getUserId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return perfil(usuario);
    }
}
