import traci
import random
import json

# Start the SUMO simulation
traci.start(["sumo-gui", "-c", "D:/Documents/SUMO_ACCIDENT/SUMO_ACCIDENT/Configuration.sumo.cfg"])

# Data storage for logging events
data_list = []

def broadcast_message(sender_vehicle, message_type):
    """Broadcasts a message to nearby vehicles."""
    # Get position of the sending vehicle
    sender_position = traci.vehicle.getPosition(sender_vehicle)
    
    # Get all vehicles in the simulation
    all_vehicles = traci.vehicle.getIDList()
    
    # Define a broadcast range (e.g., 100 meters)
    broadcast_range = 100
    
    for vehicle in all_vehicles:
        if vehicle != sender_vehicle:
            # Get the position of each vehicle
            receiver_position = traci.vehicle.getPosition(vehicle)
            
            # Calculate distance between sender and receiver
            distance = traci.simulation.getDistance2D(sender_position[0], sender_position[1], 
                                                     receiver_position[0], receiver_position[1], False)
            
            # If the vehicle is within the broadcast range
            if distance < broadcast_range:
                # Simulate receiving the message
                process_message(vehicle, sender_vehicle, message_type)

def process_message(receiver_vehicle, sender_vehicle, message_type):
    """Processes the received message based on its type."""
    if message_type == "accident":
        print(f"Vehicle {receiver_vehicle} received accident info from {sender_vehicle}. Slowing down.")
        traci.vehicle.slowDown(receiver_vehicle, 5, 3)  # Slow down the receiver vehicle
    elif message_type == "sudden_stop":
        print(f"Vehicle {receiver_vehicle} received sudden stop info from {sender_vehicle}. Slowing down.")
        traci.vehicle.slowDown(receiver_vehicle, 3, 2)  # Slow down more gently for sudden stops

    # Log the message event
    log_event(receiver_vehicle, sender_vehicle, message_type)

def log_event(receiver_vehicle, sender_vehicle, message_type):
    """Logs the event in the data list."""
    event_data = {
        "receiver": receiver_vehicle,
        "sender": sender_vehicle,
        "message_type": message_type,
        "timestamp": traci.simulation.getTime()
    }
    data_list.append(event_data)

# Run the simulation step by step
while traci.simulation.getMinExpectedNumber() > 0:
    traci.simulationStep()
    
    # Get the list of vehicle IDs currently in the simulation
    vehicle_ids = traci.vehicle.getIDList()
    
    for vehicle_id in vehicle_ids:
        # Simulate an accident or event randomly for demonstration
        if random.random() < 0.01:  # 1% chance of an event occurring for each vehicle
            event_type = random.choice(["accident", "sudden_stop"])
            print(f"Vehicle {vehicle_id} experienced a {event_type}. Broadcasting...")
            # Broadcast the event to nearby vehicles
            broadcast_message(vehicle_id, event_type)



# Save the data to a JSON file
#with open("acc_data.json", "w") as f:
#    json.dump(data_list, f, indent=4)

#print("Traffic data saved to 'acc_data.json'.")
# Close the simulation
traci.close()
