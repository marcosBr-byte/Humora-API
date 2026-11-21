package br.com.projetoSpringBoot.spring_boot.model;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Emocoes;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "registro_fect")
public class RegistroFect {
    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Emocoes emocao;

    @Column(nullable = false)
    private int intensidade;
}
