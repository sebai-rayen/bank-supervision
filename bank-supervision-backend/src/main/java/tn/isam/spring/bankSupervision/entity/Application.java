package tn.isam.spring.bankSupervision.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
public class Application  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String version;
    private String status;
    private LocalDateTime lastCheck;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "server_id")
    private Server server;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Personne user;

    @JsonProperty("servers")
    public String getServers() {
        return server != null ? server.getName() : null;
    }

    @JsonProperty("serverId")
    public Long getServerId() {
        return server != null ? server.getId() : null;
    }

    @JsonProperty("userEmail")
    public String getUserEmail() {
        return user != null ? user.getEmail() : null;
    }

    @JsonProperty("userName")
    public String getUserName() {
        return user != null ? user.getNom() : null;
    }

    @JsonIgnore
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL)
    private List<Alert> alerts;

    // Getters & Setters
}
