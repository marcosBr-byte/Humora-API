package br.com.projetoSpringBoot.spring_boot.services;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Emocoes;
import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.model.Diario;
import br.com.projetoSpringBoot.spring_boot.repositories.DiarioRepositories;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Service
public class DiarioService {
    private final DiarioRepositories diarioRepositories;

    @Transactional
    public Diario create(Diario diario) {
        return diarioRepositories.save(diario);
    }

    @Transactional
    public Diario atualizarDoAluno(Long id, Long alunoId, Emocoes emocoes) {
        Diario diario = buscarDoAluno(id, alunoId);
        diario.setEmocoes(emocoes);
        return diario;
    }

    @Transactional
    public void deletarDoAluno(Long id, Long alunoId) {
        diarioRepositories.delete(buscarDoAluno(id, alunoId));
    }

    public List<Diario> findAllByDiario(Aluno aluno) {
        LocalDateTime agora = LocalDateTime.now();
        return diarioRepositories.findAllDiarioByAluno(aluno).stream()
                .filter(diario -> diario.getDataExpiracao() == null || diario.getDataExpiracao().isAfter(agora))
                .toList();
    }

    private Diario buscarDoAluno(Long id, Long alunoId) {
        return diarioRepositories.findByIdAndAlunoId(id, alunoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
