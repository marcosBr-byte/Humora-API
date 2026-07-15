package br.com.projetoSpringBoot.spring_boot.services;

import br.com.projetoSpringBoot.spring_boot.model.Aluno;
import br.com.projetoSpringBoot.spring_boot.repositories.AlunoRepositories;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class AlunoService {

    @Autowired
    private final AlunoRepositories alunoRepositories;

    public List<Aluno> findAll(){
        return alunoRepositories.findAll();
    }

    public Aluno findById(Long id) {
        Optional<Aluno> aluno = this.alunoRepositories.findById(id);
        return aluno.orElseThrow(() -> new RuntimeException(
                "Aluno não encontrado"
        ));
    }
    @Transactional
    public Aluno create(Aluno obj){
        obj =  this.alunoRepositories.save(obj);
        return obj;
    }
    @Transactional
    public Aluno update(Aluno obj){
        Aluno newObj = findById(obj.getId());
        if(Objects.nonNull(obj.getNome())){newObj.setNome(obj.getNome());}
        if(Objects.nonNull((obj.getEmail()))) {newObj.setEmail(obj.getEmail());}
        if(Objects.nonNull((obj.getSenha()))) {newObj.setSenha(obj.getSenha());}
        if(Objects.nonNull((obj.getSerie()))) {newObj.setSerie(obj.getSerie());}
        if(Objects.nonNull(obj.getTurma())) {newObj.setTurma(obj.getTurma());}
        return this.alunoRepositories.save(newObj);
    }

    public void delete(Long id){
        findById(id);
        try {
            this.alunoRepositories.deleteById(id);
        }
        catch (EmptyResultDataAccessException e){
            throw new RuntimeException(
                    "Não pode exluir pois há Entidades Relacionadas"
            );
        }
    }

    public Aluno save (Aluno aluno){
        return this.alunoRepositories.save(aluno);
    }
}