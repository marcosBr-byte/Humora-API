package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.dto.CriarDiarioDTO;
import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.model.Diario;
import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import br.com.projetoSpringBoot.spring_boot.services.DiarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@RestController
@RequestMapping("/aluno")
public class AlunoController {
    private final AlunoService alunoService;
    private final DiarioService diarioService;

    // DIÁRIO

    @GetMapping("/diario")
    public ResponseEntity<List<Diario>> findAll(@RequestParam String email) {
        Optional<Aluno> aluno = alunoService.findByEmail(email);
        if (!aluno.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        List<Diario> diarios = diarioService.findAllByDiario(aluno.get());
        return ResponseEntity.ok(diarios);
    }

    @PostMapping("/diario")
    public ResponseEntity<Diario> create(@RequestBody CriarDiarioDTO diarioDTO) {
        Optional<Aluno> aluno = alunoService.findByEmail(diarioDTO.email());
        if (!aluno.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Diario diario = new Diario(diarioDTO.emocoe(), aluno.get(), LocalDateTime.now().plusMonths(2));
        diario = diarioService.create(diario);
        return ResponseEntity.status(HttpStatus.CREATED).body(diario);
    }

    @DeleteMapping("/diario/{id}")
    public ResponseEntity<String> deletarDiario(@PathVariable Long id) {
        diarioService.delete(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("O Diario foi removido com sucesso");
    }

    @PutMapping("/diario/{id}")
    public ResponseEntity<Diario> update(@PathVariable Long id, @RequestBody CriarDiarioDTO diarioDTO) {
        Diario diario = diarioService.findById(id);
        if (diarioDTO.emocoe() != null) {
            diario.setEmocoes(diarioDTO.emocoe());
        }
        return ResponseEntity.ok(diarioService.update(diario));
    }

    // ALUNO

    @GetMapping
    public ResponseEntity<List<Aluno>> FindAll() {
        List<Aluno> alunos = alunoService.findAll();
        return ResponseEntity.ok(alunos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aluno> findById(@PathVariable Long id) {
        return ResponseEntity.ok(alunoService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        alunoService.delete(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("O Aluno foi deletado com sucesso");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("O Aluno foi modificado com sucesso");
    }
}