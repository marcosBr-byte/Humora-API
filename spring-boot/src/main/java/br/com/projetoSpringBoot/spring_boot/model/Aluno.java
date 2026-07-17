package br.com.projetoSpringBoot.spring_boot.model;

import br.com.projetoSpringBoot.spring_boot.enumeradores.Serie;
import br.com.projetoSpringBoot.spring_boot.enumeradores.Turma;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "alunotabela")
public class Aluno implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "id", nullable = false,unique = true)
        private Long id;
    @Column(name = "nome", nullable = false,unique = true)
        private String nome;
    @Column(name = "email", nullable = false,unique = true)
        private String email;
    @Column(name = "senha", nullable = false,unique = false)
        private String senha;
    @Enumerated(EnumType.STRING)
        private Serie serie;
    @Enumerated(EnumType.STRING)
        private Turma turma;

    public Aluno() {

    }

    public Aluno(Long id, String nome, String email, String senha, Serie serie, Turma turma) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.serie = serie;
        this.turma = turma;

    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_ALUNO"));
    }

    @Override
    public @Nullable String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
