package ie.listit.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String stripeCustomerId;

    private boolean listMePlusActive;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point location; // PostGIS Point for 5km radius logic
}

enum Role {
    USER, BUSINESS, ADMIN
}
