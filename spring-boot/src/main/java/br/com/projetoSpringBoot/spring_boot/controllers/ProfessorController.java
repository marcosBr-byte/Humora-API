package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.model.Professor;
import br.com.projetoSpringBoot.spring_boot.services.ProfessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/professor")
public class ProfessorController {
    private final ProfessorService professorService;

    @GetMapping
    public ResponseEntity<List<Professor>> FindAll(){
        List<Professor> professores = professorService.findAll();
        return ResponseEntity.ok(professores);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Professor> findById(@PathVariable Long id){
        return ResponseEntity.ok(professorService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Professor> save(@RequestBody Professor professor){
        return ResponseEntity.status(HttpStatus.CREATED).body(professorService.create(professor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("O Professor foi deletado com sucesso.");
    }

    @PutMapping()
   public ResponseEntity update(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("O Professor foi modificado com sucesso.");
    }


}
