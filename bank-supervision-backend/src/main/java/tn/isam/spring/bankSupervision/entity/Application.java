package tn.isam.spring.bankSupervision.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    private String servers;
    private String version;
    private String status;
    private LocalDateTime lastCheck;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "server_id")
    private Server server;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @JsonIgnore
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL)
    private List<Alert> alerts;

    // Getters & Setters
}
