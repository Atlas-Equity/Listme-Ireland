package ie.listit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_listings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ItemListing extends Listing {
    private String itemCondition; // e.g., NEW, USED, REFURBISHED

    private LocalDateTime auctionEndTime; // For 7-day auctions
    
    private BigDecimal buyNowPrice;

    private BigDecimal currentBid;

    private boolean deliveryAvailable;
    private boolean pickupAvailable;
}
