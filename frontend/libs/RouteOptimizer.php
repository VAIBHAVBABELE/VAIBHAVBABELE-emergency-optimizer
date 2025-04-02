<?php
class RouteOptimizer {
    private $lastEstimate;
    
    public function calculateRoutes($sources, $destination, $requiredQuantity) {
        // Simplified route optimization algorithm
        // In production, integrate with Mapbox/Google Maps API
        
        $allocated = 0;
        $routes = [];
        
        // Sort sources by distance to destination
        usort($sources, function($a, $b) use ($destination) {
            $distA = $this->calculateDistance($a, $destination);
            $distB = $this->calculateDistance($b, $destination);
            return $distA <=> $distB;
        });

        // Allocate resources from nearest sources
        foreach ($sources as $source) {
            $allocate = min($source['quantity'], $requiredQuantity - $allocated);
            
            if ($allocate > 0) {
                $routes[] = [
                    'warehouse_id' => $source['id'],
                    'warehouse_name' => $source['name'],
                    'quantity' => $allocate,
                    'distance_km' => $this->calculateDistance($source, $destination),
                    'coordinates' => [
                        'from' => [$source['latitude'], $source['longitude']],
                        'to' => [$destination['latitude'], $destination['longitude']]
                    ],
                    'waypoints' => $this->generateWaypoints($source, $destination)
                ];
                
                $allocated += $allocate;
                if ($allocated >= $requiredQuantity) break;
            }
        }

        $this->lastEstimate = $this->calculateTotalTime($routes);
        return $routes;
    }

    private function calculateDistance($pointA, $pointB) {
        // Haversine formula for distance calculation
        $lat1 = deg2rad($pointA['latitude']);
        $lon1 = deg2rad($pointA['longitude']);
        $lat2 = deg2rad($pointB['latitude']);
        $lon2 = deg2rad($pointB['longitude']);

        $deltaLat = $lat2 - $lat1;
        $deltaLon = $lon2 - $lon1;

        $a = sin($deltaLat/2) * sin($deltaLat/2) +
             cos($lat1) * cos($lat2) *
             sin($deltaLon/2) * sin($deltaLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return 6371 * $c; // Earth radius in km
    }

    private function generateWaypoints($source, $destination) {
        // Simplified straight-line waypoints
        // In production, use Mapbox Directions API
        return [
            [$source['latitude'], $source['longitude']],
            [$destination['latitude'], $destination['longitude']]
        ];
    }

    private function calculateTotalTime($routes) {
        // Estimated time in minutes (60 km/h average speed + 30 min handling)
        $total = 0;
        foreach ($routes as $route) {
            $total += ($route['distance_km'] / 60 * 60) + 30;
        }
        return round($total);
    }

    public function getLastEstimate() {
        return $this->lastEstimate;
    }
}
?>