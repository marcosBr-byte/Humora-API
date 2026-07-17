package br.com.projetoSpringBoot.spring_boot.services;

import br.com.projetoSpringBoot.spring_boot.model.Diario;
import br.com.projetoSpringBoot.spring_boot.repositories.DiarioRepositories;
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
public class DiarioService {

    @Autowired
    private final DiarioRepositories diarioRepositories;

    public List<Diario> findAll() {return diarioRepositories.findAll();}

    public Diario findById(Long id) {
        Optional<Diario> diario = this.diarioRepositories.findById(id);
        return diario.orElseThrow(() -> new RuntimeException(
                "Diário não encontrado"
        ));
    }
    @Transactional
    public Diario create(Diario obj) {
        obj =  this.diarioRepositories.save(obj);
        return obj;
    }

    @Transactional
    public Diario update(Diario obj) {
        Diario newObj = findById(obj.getId());
        if(Objects.nonNull(obj.getDataExpiracao())) {newObj.setDataExpiracao(obj.getDataExpiracao());}
        if(Objects.nonNull((obj.getEmocoes()))) {newObj.setEmocoes(obj.getEmocoes());}
        if(Objects.nonNull(obj.getAluno())) {newObj.setAluno(obj.getAluno());}
        return diarioRepositories.save(newObj);
    }


    public void delete(Long id) {
        findById(id);
        try {
            this.diarioRepositories.deleteById(id);
        }
        catch (EmptyResultDataAccessException e) {
            throw new RuntimeException(
                    "Não pode exluir pois há Entidades Relacionadas"
            );
        }

    }

    public Diario save(Diario diario) {return this.diarioRepositories.save(diario);}

}


