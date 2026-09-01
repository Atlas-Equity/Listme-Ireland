package ie.listit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "service_listings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ServiceListing extends Listing {
    private String serviceType;
    
    private String availability; // e.g., "Weekdays 9-5", "24/7"
}
