package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Emocoes;
import br.com.projetoSpringBoot.spring_boot.repositories.RegistroFectRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class FectController {
    private final RegistroFectRepository registros;

    public record Registro(@NotNull UUID id, @NotNull Emocoes emocao, @Min(1) @Max(5) int intensidade) {}
    public record Contagem(Emocoes emocao, long total, long somaIntensidades) {}

    @GetMapping("/visitante.html")
    public String painelVisitante() {
        return "forward:/aluno.html";
    }

    @PostMapping("/fect/registros")
    public ResponseEntity<Void> registrar(@Valid @RequestBody Registro registro) {
        registros.registrar(registro.id(), registro.emocao().name(), registro.intensidade());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/professor/fect")
    public ResponseEntity<List<Contagem>> resumo() {
        var contagens = registros.resumir().stream()
                .map(item -> new Contagem(item.getEmocao(), item.getTotal(), item.getSomaIntensidades()))
                .toList();
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(contagens);
    }
}
