package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.config.JWTUserData;
import br.com.projetoSpringBoot.spring_boot.dto.AlunoPerfilDTO;
import br.com.projetoSpringBoot.spring_boot.dto.CriarDiarioDTO;
import br.com.projetoSpringBoot.spring_boot.dto.DiarioDTO;
import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.model.Diario;
import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import br.com.projetoSpringBoot.spring_boot.services.DiarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/aluno")
public class AlunoController {
    private final AlunoService alunoService;
    private final DiarioService diarioService;

    @GetMapping("/me")
    public AlunoPerfilDTO perfil(@AuthenticationPrincipal JWTUserData usuario) {
        return AlunoPerfilDTO.from(alunoService.findById(usuario.getUserId()));
    }

    @GetMapping("/diario")
    public List<DiarioDTO> listarDiarios(@AuthenticationPrincipal JWTUserData usuario) {
        Aluno aluno = alunoService.findById(usuario.getUserId());
        return diarioService.findAllByDiario(aluno).stream().map(DiarioDTO::from).toList();
    }

    @PostMapping("/diario")
    public ResponseEntity<DiarioDTO> criarDiario(@AuthenticationPrincipal JWTUserData usuario,
                                                @Valid @RequestBody CriarDiarioDTO dados) {
        Aluno aluno = alunoService.findById(usuario.getUserId());
        Diario diario = new Diario(dados.emocoes(), aluno, LocalDateTime.now().plusMonths(2));
        return ResponseEntity.status(HttpStatus.CREATED).body(DiarioDTO.from(diarioService.create(diario)));
    }

    @DeleteMapping("/diario/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarDiario(@AuthenticationPrincipal JWTUserData usuario, @PathVariable Long id) {
        diarioService.deletarDoAluno(id, usuario.getUserId());
    }

    @PutMapping("/diario/{id}")
    public DiarioDTO atualizarDiario(@AuthenticationPrincipal JWTUserData usuario, @PathVariable Long id,
                                     @Valid @RequestBody CriarDiarioDTO dados) {
        return DiarioDTO.from(diarioService.atualizarDoAluno(id, usuario.getUserId(), dados.emocoes()));
    }

    @GetMapping("/{id}")
    public AlunoPerfilDTO consultar(@AuthenticationPrincipal JWTUserData usuario, @PathVariable Long id) {
        exigirTitular(usuario, id);
        return perfil(usuario);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@AuthenticationPrincipal JWTUserData usuario, @PathVariable Long id) {
        exigirTitular(usuario, id);
        alunoService.delete(id);
    }

    private void exigirTitular(JWTUserData usuario, Long id) {
        if (!usuario.getUserId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }
}
