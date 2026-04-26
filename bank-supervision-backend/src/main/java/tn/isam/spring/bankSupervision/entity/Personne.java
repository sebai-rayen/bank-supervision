package tn.isam.spring.bankSupervision.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Setter
@Getter
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype", discriminatorType = DiscriminatorType.STRING)
public abstract class Personne implements UserDetails {

    @Id
    @GeneratedValue
    private Long id;
    private String password;
    private String nom;
    private String email;
    @Column(nullable = true)
    private Boolean active = true;

    // كل subclass يحدد صلاحياته
    @Override
    public abstract Collection<? extends GrantedAuthority> getAuthorities();

    String getPass(){
        return password;
    }

    public boolean isActive() {
        return this.active == null || this.active;
    }
}
