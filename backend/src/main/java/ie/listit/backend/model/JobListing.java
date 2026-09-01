package ie.listit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "job_listings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class JobListing extends Listing {
    private String companyName;
    
    private String employmentType; // FULL_TIME, PART_TIME, CONTRACT
    
    @Enumerated(EnumType.STRING)
    private JobPromotionTier promotionTier = JobPromotionTier.NONE;
}

enum JobPromotionTier {
    NONE, BRONZE, SILVER, GOLD, PLATINUM
}
