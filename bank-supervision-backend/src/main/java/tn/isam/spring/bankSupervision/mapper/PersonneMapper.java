package tn.isam.spring.bankSupervision.mapper;

import org.springframework.stereotype.Component;
import tn.isam.spring.bankSupervision.dto.response.PersonneResponse;
import tn.isam.spring.bankSupervision.entity.Admin;
import tn.isam.spring.bankSupervision.entity.Personne;

@Component
public class PersonneMapper {

    public PersonneResponse toResponse(Personne personne) {
        final String roleType = (personne instanceof Admin) ? "ADMIN" : "USER";
        return PersonneResponse.builder()
                .id(personne.getId())
                .nom(personne.getNom())
                .email(personne.getEmail())
                .roleType(roleType)
                .active(personne.isActive())
                .build();
    }
}
