package br.com.projetoSpringBoot.spring_boot.services;

import br.com.projetoSpringBoot.spring_boot.model.Professor;
import br.com.projetoSpringBoot.spring_boot.repositories.ProfessorRepositories;
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
public class ProfessorService {

    @Autowired
    private final ProfessorRepositories professorRepositories;

    public List<Professor> findAll() {return professorRepositories.findAll();}

    public Professor findById(Long id){
        Optional<Professor> professor = professorRepositories.findById(id);
        return professor.orElseThrow(() -> new RuntimeException(
                "Professor não encontrado"
        ));
    }

    public Professor findProfessorByEmail(String email){
        return professorRepositories.findProfessorByEmail(email);
    }

    @Transactional
    public Professor create(Professor obj){
        obj = professorRepositories.save(obj);
        return obj;
    }

    @Transactional
    public Professor update(Professor obj){
        Professor newObj = findById(obj.getId());
        if(Objects.nonNull(obj.getNome())){obj.setNome(obj.getNome());}
        if(Objects.nonNull(obj.getEmail())){obj.setEmail(obj.getEmail());}
        if(Objects.nonNull((obj.getSenha()))){obj.setSenha(obj.getSenha());}
        if(Objects.nonNull(obj.getMateria())){obj.setMateria(obj.getMateria());}
        return professorRepositories.save(newObj);
    }

    @Transactional
    public void delete(Long id){
        findById(id);
        try {
            this.professorRepositories.deleteById(id);
        }
        catch (EmptyResultDataAccessException e){
            throw new RuntimeException(
                    "Não pode exluir pois há Entidades Relacionadas"
            );
        }

    }
}
