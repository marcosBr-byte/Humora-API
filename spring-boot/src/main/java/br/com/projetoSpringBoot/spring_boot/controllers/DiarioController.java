package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.model.Diario;
import br.com.projetoSpringBoot.spring_boot.services.DiarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/diàrio")
public class DiarioController {
    private final DiarioService diarioService;

    @GetMapping
    public ResponseEntity<List<Diario>> findAll(){
      List<Diario> diarios = diarioService.findAll();
      return ResponseEntity.ok().body(diarios);
    }

    @GetMapping("{id}")
    public ResponseEntity<Diario> findById(@PathVariable Long id){
        return ResponseEntity.ok().body(diarioService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Diario> save(@RequestBody Diario diario){
        return ResponseEntity.ok().body(diarioService.create(diario));
    }

    @DeleteMapping("{id}")
    public ResponseEntity delete(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("O Diário foi deletado com sucesso.");
    }

    @PutMapping
    public ResponseEntity update(@RequestBody Long id){
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("O Diário foi modificado com sucesso.");
    }
}
