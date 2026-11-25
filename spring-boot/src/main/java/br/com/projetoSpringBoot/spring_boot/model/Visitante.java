package br.com.projetoSpringBoot.spring_boot.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "visitante")
public class Visitante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "primeiro_nome", nullable = false, length = 40)
    private String primeiroNome;

    @Column(nullable = false, length = 80)
    private String cidade;

    protected Visitante() {}

    public Visitante(String primeiroNome, String cidade) {
        this.primeiroNome = primeiroNome;
        this.cidade = cidade;
    }
}
