package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/aluno")
public class AlunoController {
    private final AlunoService alunoService;
    
    @GetMapping
    public ResponseEntity<List<Aluno>> FindAll(){
        List<Aluno> alunos = alunoService.findAll();
        return ResponseEntity.ok(alunos);
    }
    @GetMapping("{id}")
    public ResponseEntity<Aluno> findById(@PathVariable Long id){
        return ResponseEntity.ok(alunoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Aluno> save(@RequestBody Aluno aluno){
        return ResponseEntity.status(HttpStatus.CREATED).body(alunoService.save(aluno));

    }

    @DeleteMapping("{id}")
    public ResponseEntity delete(@PathVariable Long id){
        return  ResponseEntity.status(HttpStatus.ACCEPTED).body("O Aluno foi deletado com sucesso");
    }

    @PutMapping("{id}")
    public  ResponseEntity update(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("O Aluno foi modificado com sucesso")  ;
    }



}
