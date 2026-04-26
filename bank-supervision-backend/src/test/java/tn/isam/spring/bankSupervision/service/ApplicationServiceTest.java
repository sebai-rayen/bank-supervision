package tn.isam.spring.bankSupervision.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import tn.isam.spring.bankSupervision.dto.request.ApplicationRequest;
import tn.isam.spring.bankSupervision.entity.Application;
import tn.isam.spring.bankSupervision.entity.Personne;
import tn.isam.spring.bankSupervision.entity.Server;
import tn.isam.spring.bankSupervision.entity.User;
import tn.isam.spring.bankSupervision.repository.ApplicationRepository;
import tn.isam.spring.bankSupervision.repository.PersonneRepository;
import tn.isam.spring.bankSupervision.repository.ServerRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ServerRepository serverRepository;

    @Mock
    private PersonneRepository personneRepository;

    @InjectMocks
    private ApplicationService applicationService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void addApplication_savesSelectedServerAndCurrentUser() {
        ApplicationRequest request = new ApplicationRequest();
        request.setName("Core Banking");
        request.setServerId(7L);
        request.setVersion("v1.0.0");
        request.setStatus("Running");
        request.setAssignedUserId(99L);

        Server server = new Server();
        server.setId(7L);
        server.setName("srv-prod-01");

        Personne user = new User();
        user.setId(99L);
        user.setEmail("user@bank.com");

        when(serverRepository.findById(7L)).thenReturn(Optional.of(server));
        when(personneRepository.findById(99L)).thenReturn(Optional.of(user));
        when(applicationRepository.saveAndFlush(any(Application.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Application saved = applicationService.addApplication(request);

        ArgumentCaptor<Application> captor = ArgumentCaptor.forClass(Application.class);
        verify(applicationRepository).saveAndFlush(captor.capture());

        Application persisted = captor.getValue();
        assertEquals("Core Banking", persisted.getName());
        assertNotNull(persisted.getServer());
        assertEquals(7L, persisted.getServer().getId());
        assertEquals("srv-prod-01", persisted.getServer().getName());
        assertEquals("v1.0.0", persisted.getVersion());
        assertEquals("Running", persisted.getStatus());
        assertEquals(user, persisted.getUser());
        assertNotNull(persisted.getLastCheck());

        assertEquals("srv-prod-01", saved.getServers());
    }
}
