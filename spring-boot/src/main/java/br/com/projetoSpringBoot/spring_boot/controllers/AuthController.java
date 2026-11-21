package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.config.TokenConfig;
import br.com.projetoSpringBoot.spring_boot.dto.AlunoDTO;
import br.com.projetoSpringBoot.spring_boot.dto.LoginRequestDTO;
import br.com.projetoSpringBoot.spring_boot.dto.LoginResponseDTO;
import br.com.projetoSpringBoot.spring_boot.dto.ProfessorDTO;
import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.model.Professor;
import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import br.com.projetoSpringBoot.spring_boot.services.ProfessorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.AuthenticationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AlunoService alunoService;

    @Autowired
    private ProfessorService professorService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenConfig tokenConfig;

    @PostMapping("/login/aluno")
    public ResponseEntity<?> logarAluno(@Valid @RequestBody LoginRequestDTO login) {
        try {
            if (autenticar(login) instanceof Aluno aluno) {
                return ResponseEntity.ok(new LoginResponseDTO(tokenConfig.generateToken(aluno)));
            }
        } catch (AuthenticationException e) {
            return credenciaisInvalidas();
        }
        return credenciaisInvalidas();
    }

    @PostMapping("/login/professor")
    public ResponseEntity<?> logarProfessor(@Valid @RequestBody LoginRequestDTO login) {
        try {
            if (autenticar(login) instanceof Professor professor) {
                return ResponseEntity.ok(new LoginResponseDTO(tokenConfig.generateToken(professor)));
            }
        } catch (AuthenticationException e) {
            return credenciaisInvalidas();
        }
        return credenciaisInvalidas();
    }

    private Object autenticar(LoginRequestDTO login) {
        var credenciais = UsernamePasswordAuthenticationToken.unauthenticated(login.email(), login.senha());
        return authenticationManager.authenticate(credenciais).getPrincipal();
    }

    private ResponseEntity<String> credenciaisInvalidas() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas");
    }

    @PostMapping("/register/aluno")
    public ResponseEntity<?> registrarAluno(@Valid @RequestBody AlunoDTO alunoDTO) {
        try {
            if (!alunoDTO.getEmail().contains("@")) {
                return ResponseEntity.badRequest().body("Email invalido");
            }

            if (alunoService.findByEmail(alunoDTO.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email já cadastrado como aluno");
            }

            if (professorService.findProfessorByEmail(alunoDTO.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email já cadastrado como professor. Use outro email.");
            }


            Aluno aluno = new Aluno();
            aluno.setSenha(passwordEncoder.encode(alunoDTO.getSenha()));
            aluno.setNome(alunoDTO.getNome());
            aluno.setEmail(alunoDTO.getEmail());
            aluno.setTurma(alunoDTO.getTurma());
            aluno.setSerie(alunoDTO.getSerie());

            alunoService.create(aluno);

            return ResponseEntity.status(HttpStatus.CREATED).body("Aluno criado com sucesso!");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("E-mail já cadastrado.");
        }
    }

    @PostMapping("/register/professor")
    public ResponseEntity<?> registrarProfessor(
            @Valid @RequestBody ProfessorDTO professorDTO) {

        try {

            if (alunoService.findByEmail(professorDTO.getEmail()).isPresent()
                    || professorService.findProfessorByEmail(professorDTO.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("E-mail já cadastrado.");
            }

            Professor professor = new Professor(
                    null,
                    professorDTO.getNome(),
                    professorDTO.getEmail(),
                    passwordEncoder.encode(professorDTO.getSenha()),
                    professorDTO.getMateria()
            );

            professorService.create(professor);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Professor criado com sucesso!");

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("E-mail já cadastrado.");
        }
    }
}