package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.dto.DiarioDTO;
import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.model.Diario;
import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import br.com.projetoSpringBoot.spring_boot.services.DiarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@RestController
@RequestMapping("/aluno")
public class AlunoController {
    private final AlunoService alunoService;
    private  final DiarioService diarioService;

    // DO DIÁRIO
    @GetMapping("/diario")
    public ResponseEntity<List<Diario>> findAll(@RequestBody DiarioDTO diarioDTO) {
         Optional <Aluno> aluno = alunoService.findByEmail(diarioDTO.email());
         if (!aluno.isPresent()) {
             return new ResponseEntity<>(HttpStatus.NOT_FOUND);
         }
        List<Diario> diarios = diarioService.findAllByDiario(aluno.get());
        return ResponseEntity.ok(diarios);
    }

    @PostMapping("/diario")
    public ResponseEntity<Diario> create(@RequestBody Diario diario){
        return ResponseEntity.status(HttpStatus.CREATED).body(diarioService.create(diario));
    }

    @DeleteMapping("/diario/{id}")
    public ResponseEntity deletarDiario(@PathVariable Long id){
        alunoService.delete(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("O Diario foi removido com sucesso");
    }

    @PutMapping("/diario")
    public ResponseEntity<Diario> update(@RequestBody Diario diario){
        return ResponseEntity.ok(diarioService.update(diario));
    }


    // DO ALUNO
    @GetMapping
    public ResponseEntity<List<Aluno>> FindAll(){
        List<Aluno> alunos = alunoService.findAll();
        return ResponseEntity.ok(alunos);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Aluno> findById(@PathVariable Long id){
        return ResponseEntity.ok(alunoService.findById(id));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable Long id){
        return  ResponseEntity.status(HttpStatus.ACCEPTED).body("O Aluno foi deletado com sucesso");
    }

    @PutMapping("/{id}")
    public  ResponseEntity update(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("O Aluno foi modificado com sucesso")  ;
    }

}
