package br.com.projetoSpringBoot.spring_boot.controllers;

import br.com.projetoSpringBoot.spring_boot.config.TokenConfig;
import br.com.projetoSpringBoot.spring_boot.dto.AlunoDTO;
import br.com.projetoSpringBoot.spring_boot.dto.LoginRequestDTO;
import br.com.projetoSpringBoot.spring_boot.dto.LoginResponseDTO;
import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.repositories.AlunoRepositories;
import br.com.projetoSpringBoot.spring_boot.repositories.ProfessorRepositories;
import br.com.projetoSpringBoot.spring_boot.services.AlunoService;
import br.com.projetoSpringBoot.spring_boot.services.ProfessorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity logarAluno(@RequestBody LoginRequestDTO login){

        UsernamePasswordAuthenticationToken userAndPass = new UsernamePasswordAuthenticationToken(login.email(), login.senha());
        Authentication authentication = authenticationManager.authenticate(userAndPass);

        Aluno aluno = (Aluno) authentication.getPrincipal();
        String token = tokenConfig.generateToken(aluno);
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register/aluno")
    public ResponseEntity reistrarAluno(@Valid @RequestBody AlunoDTO alunoDTO){
        Aluno aluno = new Aluno();
        aluno.setSenha(passwordEncoder.encode(alunoDTO.getSenha()));
        aluno.setNome(alunoDTO.getNome());
        aluno.setEmail(alunoDTO.getEmail());
        aluno.setTurma(alunoDTO.getTurma());

        alunoService.save(aluno);

        return ResponseEntity.status(HttpStatus.CREATED).body("Aluno criado com sucesso!");
    }


}
