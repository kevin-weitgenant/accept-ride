import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import RideRequestCard from '../../components/RideRequestCard'; // Adjust path if needed

// Define the structure for ride data
interface RideData {
  id: number;
  startAddress: string;
  endAddress: string;
  cost: number;
  pickupTime: string;
  dropoffTime: string;
  rating: number;
  isFrequentRider: boolean;
}

// --- Random Data Generation ---
const streetNames = ['Rua Principal', 'Av. Central', 'Travessa das Flores', 'Alameda dos Pássaros', 'Estrada Velha', 'Rua da Praia', 'Av. Brasil', 'Rua Marechal Deodoro', 'Av. Pres. Juscelino Kubitscheck'];
const neighborhoods = ['Centro', 'Fatima', 'Vila Nova', 'Jardim Europa', 'Parque Residencial', 'Laranjal', 'Fragata'];
const cities = ['Pelotas', 'Rio Grande', 'Porto Alegre', 'São Paulo', 'Rio de Janeiro'];
const states = ['RS', 'SC', 'PR', 'SP', 'RJ'];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomAddress = (): string => {
  const street = getRandomElement(streetNames);
  const number = Math.floor(Math.random() * 2000) + 1;
  const neighborhood = getRandomElement(neighborhoods);
//  const city = getRandomElement(cities);
//  const state = getRandomElement(states);
//  const zip = `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`;
//  return `${street}, ${number}, ${neighborhood} - ${city} - ${state}, ${zip}`;
  // Simplified address for prototype clarity
  return `${street}, ${number}, ${neighborhood}`;
};

const generateRandomRide = (id: number): RideData => {
  const cost = Math.random() * 30 + 8; // Random cost between 8 and 38
  const rating = Math.random() * 1.5 + 3.5; // Random rating between 3.5 and 5.0
  const pickupDist = (Math.random() * 4 + 1).toFixed(1); // 1.0 to 5.0 km
  const pickupMinutes = Math.round(parseFloat(pickupDist) * 2.5); // Rough estimate
  const dropoffDist = (Math.random() * 10 + 1).toFixed(1); // 1.0 to 11.0 km
  const dropoffMinutes = Math.round(parseFloat(dropoffDist) * 3); // Rough estimate

  return {
    id,
    startAddress: generateRandomAddress(),
    endAddress: generateRandomAddress(),
    cost: parseFloat(cost.toFixed(2)),
    pickupTime: `${pickupMinutes} minutos (${pickupDist.replace('.', ',')} km)`,
    dropoffTime: `Viagem de ${dropoffMinutes} minutos (${dropoffDist.replace('.', ',')} km)`,
    rating: parseFloat(rating.toFixed(2)),
    isFrequentRider: Math.random() > 0.7, // 30% chance of being frequent
  };
};
// --- End Random Data Generation ---

let rideCounter = 0;
const RIDE_APPEAR_DELAY = 1500; // Delay in ms before showing the next ride

export default function HomeScreen() {
  const [currentRide, setCurrentRide] = useState<RideData | null>(null);
  const [isSearching, setIsSearching] = useState(true); // Start in searching state

  const showNewRide = useCallback(() => {
      setIsSearching(false); // Hide message when new ride appears
      rideCounter++;
      const newRide = generateRandomRide(rideCounter);
      console.log("Generated new ride:", newRide); // Log for debugging
      setCurrentRide(newRide);
  }, []);

  // Show initial ride on mount
  useEffect(() => {
    // Show the first ride after a short delay
    const initialTimeout = setTimeout(showNewRide, RIDE_APPEAR_DELAY);
    return () => clearTimeout(initialTimeout);
    // Run only once on mount
  }, [showNewRide]);


  const clearCurrentRideAndSearch = useCallback(() => {
      setCurrentRide(null);
      setIsSearching(true);
      // Trigger the next ride search after a delay
      setTimeout(showNewRide, RIDE_APPEAR_DELAY);
  }, [showNewRide]); // Dependency on showNewRide

  const handleAccept = () => {
    console.log("Ride Accepted:", currentRide?.id);
    clearCurrentRideAndSearch();
  };

  const handleRefuse = () => {
    console.log("Ride Refused:", currentRide?.id);
    clearCurrentRideAndSearch();
  };

  const handleTimeout = () => {
    console.log("Ride Timed Out:", currentRide?.id);
    clearCurrentRideAndSearch();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {currentRide ? (
        <RideRequestCard
          key={currentRide.id} // Use key to ensure component remounts on new ride
          startAddress={currentRide.startAddress}
          endAddress={currentRide.endAddress}
          cost={currentRide.cost}
          pickupTime={currentRide.pickupTime}
          dropoffTime={currentRide.dropoffTime}
          rating={currentRide.rating}
          isFrequentRider={currentRide.isFrequentRider}
          onAccept={handleAccept}
          onRefuse={handleRefuse}
          onTimeout={handleTimeout} // Pass the timeout handler
          duration={10} // Explicitly set duration to 10 seconds
        />
      ) : isSearching ? (
        <View style={styles.noRidesContainer}>
            <Text style={styles.noRidesText}>Procurando corridas...</Text>
        </View>
      ) : null /* Initially show nothing until the first ride loads */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light grey background like maps
  },
  contentContainer: {
      flexGrow: 1, // Ensures content can fill space if needed
      justifyContent: 'center', // Center content vertically
  },
  noRidesContainer: {
      // Removed flex: 1 as ScrollView contentContainer handles layout
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20, // Add some padding
      // Removed marginTop as centering is handled by contentContainerStyle
  },
  noRidesText: {
      fontSize: 18,
      color: '#666',
  }
});
