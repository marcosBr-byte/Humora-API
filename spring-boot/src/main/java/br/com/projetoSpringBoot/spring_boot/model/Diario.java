package br.com.projetoSpringBoot.spring_boot.model;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Emocoes;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "diariotabela")
public class Diario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column (name = "id", nullable = false,unique = true)
    private Long id;

    @Column (name = "dataExpiracao")
    private LocalDateTime dataExpiracao;

    @Enumerated(EnumType.STRING)
        private Emocoes emocoes;

    @ManyToOne
    @JoinColumn(name = "alunoId")
    private Aluno aluno;


    public  Diario() {

    }

    public Diario(Emocoes emocoes,Aluno aluno,LocalDateTime dataExpiracao) {
        this.emocoes = emocoes;
        this.aluno = aluno;
        this.dataExpiracao = dataExpiracao;
    }

}
