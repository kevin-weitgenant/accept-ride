import { Ionicons } from '@expo/vector-icons'; // Assuming you have expo vector icons installed
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RideRequestCardProps {
  startAddress: string;
  endAddress: string;
  cost: number;
  pickupTime: string; // e.g., "5 minutos (1.9 km)"
  dropoffTime: string; // e.g., "Viagem de 7 minutos (2.1 km)"
  rating: number;
  isFrequentRider?: boolean;
  onAccept: () => void;
  onRefuse: () => void;
  duration?: number; // Optional: Duration in seconds for the countdown
  onTimeout?: () => void; // Optional: Callback when timer runs out
}

const RideRequestCard: React.FC<RideRequestCardProps> = ({
  startAddress,
  endAddress,
  cost,
  pickupTime,
  dropoffTime,
  rating,
  isFrequentRider = false,
  onAccept,
  onRefuse,
  duration = 10, // Default duration 10 seconds
  onTimeout,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerAnimation = useRef(new Animated.Value(1)).current; // 1 represents 100%
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start countdown timer
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current!);
          if (onTimeout) {
            onTimeout();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Start animation
    Animated.timing(timerAnimation, {
      toValue: 0, // Animate to 0%
      duration: duration * 1000, // Duration in milliseconds
      easing: Easing.linear, // Linear decrease
      useNativeDriver: false, // Width animation not supported by native driver
    }).start(({ finished }) => {
        // This callback ensures onTimeout is called even if animation finishes slightly after the interval due to timing nuances
        if (finished && timeLeft <=1 && onTimeout) {
            // console.log("Animation finished, ensuring timeout called");
            // onTimeout(); // Already called by interval ideally, but can be a fallback
        }
    });

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      timerAnimation.stopAnimation(); // Stop animation if component unmounts
    };
    // Rerun effect if duration changes (though unlikely in this case)
    // Added onTimeout to dependencies as it's used inside
  }, [duration, timerAnimation, onTimeout]); // timeLeft removed to prevent restarting timer on state update

  const handlePressAccept = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timerAnimation.stopAnimation();
      onAccept();
  }

  const handlePressRefuse = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timerAnimation.stopAnimation();
      onRefuse();
  }

  // Calculate width percentage for the animation bar
  const timerWidth = timerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'], // Animate width from 100% to 0%
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.uberTypeContainer}>
          <Ionicons name="person" size={16} color="white" />
          <Text style={styles.uberType}>UberX</Text>
        </View>
        <TouchableOpacity onPress={handlePressRefuse} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.cost}>R$ {cost.toFixed(2).replace('.', ',')}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="black" />
        <Text style={styles.ratingText}>{rating.toFixed(2).replace('.', ',')}</Text>
        {/* Placeholder for dynamic surge/bonus */}
        <Ionicons name="flash" size={16} color="black" style={styles.bonusIcon} />
        <Text style={styles.bonusText}>+R$ 3,00 incluído</Text>
      </View>

      {isFrequentRider && (
        <View style={styles.frequentRiderBadge}>
          <Ionicons name="person-circle-outline" size={16} color="#555" />
          <Text style={styles.frequentRiderText}>Usuário frequente</Text>
        </View>
      )}

      <View style={styles.addressContainer}>
         <View style={styles.addressLine}>
            <View style={styles.addressTimeline}>
                <View style={styles.dot} />
                <View style={styles.line} />
                <View style={styles.square} />
            </View>
            <View style={styles.addressTextContainer}>
                <Text style={styles.timeText}>{pickupTime} de distância</Text>
                <Text style={styles.addressText}>{startAddress}</Text>
                <Text style={styles.timeText}>{dropoffTime}</Text>
                <Text style={styles.addressText}>{endAddress}</Text>
            </View>
         </View>
      </View>

      <TouchableOpacity style={styles.acceptButton} onPress={handlePressAccept}>
         {/* Timer Animation Overlay */}
         <Animated.View style={[styles.timerOverlay, { width: timerWidth }]} />
         <Text style={styles.acceptButtonText}>Aceitar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  uberTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  uberType: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  closeButton: {
    padding: 5,
  },
  cost: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 5,
    fontWeight: '500',
  },
  bonusIcon: {
      marginLeft: 15,
  },
  bonusText: {
      marginLeft: 5,
      fontWeight: '500',
      color: '#555'
  },
  frequentRiderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start', // Keep badge tight to content
    marginBottom: 15,
  },
  frequentRiderText: {
    marginLeft: 5,
    color: '#555',
    fontWeight: '500',
  },
  addressContainer: {
    marginBottom: 20,
  },
   addressLine: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the top
  },
  addressTimeline: {
    alignItems: 'center',
    marginRight: 10,
    // Adjust height based on content or make it fixed if necessary
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'black',
    marginBottom: 2, // Space between dot and line
  },
  line: {
    width: 2,
    // Adjust height dynamically or set a fixed height
    // Example fixed height for the line between dot and square
    height: 60,
    backgroundColor: 'black',
    marginVertical: 2, // Space above and below the line
  },
  square: {
    width: 10,
    height: 10,
    backgroundColor: 'black',
    marginTop: 2, // Space between line and square
  },
  addressTextContainer: {
      flex: 1, // Take remaining space
      paddingTop: 0, // Align text with the top dot
  },
  timeText: {
      fontSize: 14,
      color: '#555',
      marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10, // Space between address blocks
    lineHeight: 18, // Adjust for readability
  },
  acceptButton: {
    backgroundColor: '#007AFF', // Blue color similar to Uber's
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white overlay
    borderRadius: 8, // Match button's border radius
  },
});

export default RideRequestCard; 