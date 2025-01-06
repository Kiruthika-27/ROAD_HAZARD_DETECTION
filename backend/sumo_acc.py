import traci
import random
import json
import os

# Start the SUMO simulation
traci.start(["sumo-gui", "-c", "D:/Documents/SUMO_ACCIDENT/SUMO_ACCIDENT/Configuration.sumo.cfg"])

# Data storage for logging events
data_list = []

def broadcast_message(sender_vehicle, message_type):
    """Broadcasts a message to nearby vehicles."""
    sender_position = traci.vehicle.getPosition(sender_vehicle)
    all_vehicles = traci.vehicle.getIDList()
    broadcast_range = 100
    
    for vehicle in all_vehicles:
        if vehicle != sender_vehicle:
            receiver_position = traci.vehicle.getPosition(vehicle)
            distance = traci.simulation.getDistance2D(sender_position[0], sender_position[1], 
                                                     receiver_position[0], receiver_position[1], False)
            if distance < broadcast_range:
                process_message(vehicle, sender_vehicle, message_type)

def process_message(receiver_vehicle, sender_vehicle, message_type):
    """Processes the received message based on its type."""
    if message_type == "accident":
        print(f"Vehicle {receiver_vehicle} received accident info from {sender_vehicle}. Slowing down.")
        traci.vehicle.slowDown(receiver_vehicle, 5, 3)
        log_event(receiver_vehicle, sender_vehicle, message_type)
    elif message_type == "sudden_stop":
        print(f"Vehicle {receiver_vehicle} received sudden stop info from {sender_vehicle}. Slowing down.")
        traci.vehicle.slowDown(receiver_vehicle, 3, 2)
        log_event(receiver_vehicle, sender_vehicle, message_type)

def log_event(receiver_vehicle, sender_vehicle, message_type):
    """Logs the event into the data list."""
    event_data = {
        "receiver_vehicle": receiver_vehicle,
        "sender_vehicle": sender_vehicle,
        "message_type": message_type,
        "timestamp": traci.simulation.getTime()
    }
    data_list.append(event_data)

# Run the simulation step by step
while traci.simulation.getMinExpectedNumber() > 0:
    traci.simulationStep()
    vehicle_ids = traci.vehicle.getIDList()
    
    for vehicle_id in vehicle_ids:
        if random.random() < 0.01:
            event_type = random.choice(["accident", "sudden_stop"])
            print(f"Vehicle {vehicle_id} experienced a {event_type}. Broadcasting...")
            broadcast_message(vehicle_id, event_type)

# Save the logged data to a JSON file
json_file_path = 'event_logs.json'
with open(json_file_path, 'w') as json_file:
    json.dump(data_list, json_file, indent=4)

# Check if the data has been stored in JSON
if os.path.exists(json_file_path):
    print(f"The file '{json_file_path}' exists. Reading contents...")
    
    # Read the JSON file
    with open(json_file_path, 'r') as json_file:
        try:
            data = json.load(json_file)
            print("Data successfully loaded:")
            print(json.dumps(data, indent=4))  # Pretty-print the JSON data
        except json.JSONDecodeError:
            print("Error: The file is not a valid JSON.")
else:
    print(f"The file '{json_file_path}' does not exist.")

traci.close()
