# backend/scripts/model-training/ortools/route_optimization.py

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import math
import json
import os

class EmergencyRouteOptimizer:
    def __init__(self):
        self.locations = []
        self.demands = []
        self.vehicle_capacities = []
        self.num_vehicles = 0
        self.depot = 0  # Index of the depot location

    def load_locations(self, locations_file):
        """Load locations from JSON file"""
        with open(locations_file) as f:
            data = json.load(f)
            self.locations = data['locations']
            self.demands = data['demands']
            self.vehicle_capacities = data['vehicle_capacities']
            self.num_vehicles = len(self.vehicle_capacities)

    def create_distance_matrix(self):
        """Create distance matrix between all locations"""
        matrix = []
        for from_loc in self.locations:
            row = []
            for to_loc in self.locations:
                row.append(self.haversine_distance(from_loc, to_loc))
            matrix.append(row)
        return matrix

    def haversine_distance(self, loc1, loc2):
        """Calculate distance between two coordinates (in km)"""
        lat1, lon1 = loc1['lat'], loc1['lng']
        lat2, lon2 = loc2['lat'], loc2['lng']
        
        R = 6371  # Earth radius in km
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = (math.sin(dLat/2) * math.sin(dLat/2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dLon/2) * math.sin(dLon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    def optimize_routes(self):
        """Solve the routing problem"""
        distance_matrix = self.create_distance_matrix()
        
        # Create routing model
        manager = pywrapcp.RoutingIndexManager(
            len(self.locations), self.num_vehicles, self.depot)
        routing = pywrapcp.RoutingModel(manager)

        # Define distance callback
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return distance_matrix[from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Add capacity constraints
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            return self.demands[from_node]

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,  # null capacity slack
            self.vehicle_capacities,
            True,  # start cumul to zero
            'Capacity')

        # Set search parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH)
        search_parameters.time_limit.seconds = 5

        # Solve the problem
        solution = routing.SolveWithParameters(search_parameters)

        # Extract and return routes
        if solution:
            return self.extract_routes(manager, routing, solution)
        return None

    def extract_routes(self, manager, routing, solution):
        """Extract route information from the solution"""
        routes = []
        for vehicle_id in range(self.num_vehicles):
            index = routing.Start(vehicle_id)
            route = []
            route_distance = 0
            route_load = 0
            
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                route.append({
                    'location': self.locations[node_index],
                    'demand': self.demands[node_index]
                })
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                route_distance += routing.GetArcCostForVehicle(
                    previous_index, index, vehicle_id)
                route_load += self.demands[manager.IndexToNode(previous_index)]
            
            routes.append({
                'vehicle_id': vehicle_id,
                'distance_km': route_distance,
                'load': route_load,
                'stops': route
            })
        return routes

def main():
    # Initialize optimizer
    optimizer = EmergencyRouteOptimizer()
    
    # Load sample data (replace with your actual data path)
    data_path = r'C:\xampp\htdocs\emergency-optimizer\backend\data\delivery_locations.json'
    
    optimizer.load_locations(data_path)
    
    # Optimize routes
    routes = optimizer.optimize_routes()
    
    if routes:
        print("Optimized Routes:")
        for i, route in enumerate(routes):
            print(f"\nVehicle {i + 1}:")
            print(f"Total Distance: {route['distance_km']:.2f} km")
            print(f"Total Load: {route['load']} units")
            print("Stops:")
            for stop in route['stops']:
                loc = stop['location']
                print(f"- {loc['name']} (Lat: {loc['lat']}, Lng: {loc['lng']})")
    else:
        print("No solution found!")

if __name__ == "__main__":
    main()