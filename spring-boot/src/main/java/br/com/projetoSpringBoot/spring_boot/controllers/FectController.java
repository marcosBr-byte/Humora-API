package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Emocoes;
import br.com.projetoSpringBoot.spring_boot.repositories.RegistroFectRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Controller
@RequiredArgsConstructor
public class FectController {
    private final RegistroFectRepository registros;
    private final List<SseEmitter> conexoes = new CopyOnWriteArrayList<>();

    public record Registro(@NotNull UUID id, @NotNull Emocoes emocao, @Min(1) @Max(5) int intensidade) {}
    public record Contagem(Emocoes emocao, long total, long somaIntensidades) {}

    @GetMapping("/visitante.html")
    public String painelVisitante() {
        return "forward:/aluno.html";
    }

    @PostMapping("/fect/registros")
    public ResponseEntity<Void> registrar(@Valid @RequestBody Registro registro) {
        if (registros.registrar(registro.id(), registro.emocao().name(), registro.intensidade()) == 1) {
            conexoes.forEach(conexao -> enviar(conexao, SseEmitter.event().id(registro.id().toString()).data(registro.emocao().name())));
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping(path = {"/fect/ao-vivo", "/professor/fect/ao-vivo"}, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> aoVivo() {
        var conexao = new SseEmitter(55_000L);
        conexao.onCompletion(() -> conexoes.remove(conexao));
        conexao.onTimeout(() -> conexoes.remove(conexao));
        conexao.onError(erro -> conexoes.remove(conexao));
        conexoes.add(conexao);
        enviar(conexao, SseEmitter.event().reconnectTime(1500).comment("conectado"));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(conexao);
    }

    private void enviar(SseEmitter conexao, SseEmitter.SseEventBuilder evento) {
        try {
            conexao.send(evento);
        } catch (IOException | IllegalStateException erro) {
            conexoes.remove(conexao);
        }
    }

    @GetMapping("/professor/fect")
    public ResponseEntity<List<Contagem>> resumo() {
        var contagens = registros.resumir().stream()
                .map(item -> new Contagem(item.getEmocao(), item.getTotal(), item.getSomaIntensidades()))
                .toList();
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(contagens);
    }
}
