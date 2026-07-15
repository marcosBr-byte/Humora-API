package br.com.projetoSpringBoot.spring_boot.model;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Materia;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Professor  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "id", nullable = false,unique = true)
        private Long id;
    @Column(name = "nome", nullable = false,unique = true)
        private String nome;
    @Column(name = "email", nullable = false,unique = true)
        private String email;
    @Column(name = "senha", nullable = false,unique = true)
        private String senha;
    @Enumerated(EnumType.STRING)
        private Materia materia;

    @CreationTimestamp
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    private LocalDateTime dataAtualizacao;

    public Professor() {

    }

    public Professor(Long id, String nome, String email, String senha, Materia materia) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.materia = materia;


    }
}
