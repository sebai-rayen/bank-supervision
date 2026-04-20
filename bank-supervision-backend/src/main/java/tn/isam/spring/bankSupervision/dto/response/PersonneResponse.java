package tn.isam.spring.bankSupervision.dto.response;

import lombok.Builder;
import lombok.Value;
import tn.isam.spring.bankSupervision.entity.Personne;
import tn.isam.spring.bankSupervision.entity.Admin;

@Value
@Builder
public class PersonneResponse {
    Long id;
    String nom;
    String email;
    String roleType;
    boolean active;
}
