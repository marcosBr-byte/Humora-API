package br.com.projetoSpringBoot.spring_boot.repositories;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Emocoes;
import br.com.projetoSpringBoot.spring_boot.model.RegistroFect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface RegistroFectRepository extends JpaRepository<RegistroFect, UUID> {
    interface Resumo {
        Emocoes getEmocao();
        long getTotal();
        long getSomaIntensidades();
    }

    @Query("""
            select r.emocao as emocao, count(r) as total, sum(r.intensidade) as somaIntensidades
            from RegistroFect r group by r.emocao
            """)
    List<Resumo> resumir();

    @Transactional
    @Modifying
    @Query(value = """
            insert into registro_fect (id, emocao, intensidade) values (:id, :emocao, :intensidade)
            on conflict (id) do nothing
            """, nativeQuery = true)
    void registrar(UUID id, String emocao, int intensidade);
}
