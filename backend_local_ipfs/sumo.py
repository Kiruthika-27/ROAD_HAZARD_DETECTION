import traci
import json

# Initialize SUMO (replace 'your_sumo_config_file.sumocfg' with your actual config file)
sumoBinary = "sumo-gui"  # or "sumo" for non-GUI mode.
sumoCmd = [sumoBinary, "-c", "D:/Documents/SUMO_ACCIDENT/SUMO_ACCIDENT/Configuration.sumo.cfg"]
traci.start(sumoCmd)

# Function to get traffic data.
def get_traffic_data():
    data = {
        "timestamp": traci.simulation.getTime(),
        "vehicles": []
    }
    for vehID in traci.vehicle.getIDList():
        data["vehicles"].append({
            "id": vehID,
            "position": traci.vehicle.getPosition(vehID),
            "speed": traci.vehicle.getSpeed(vehID),
            "lane": traci.vehicle.getLaneID(vehID)
        })
    return data

# Simulate and collect data.
for step in range(100):  # Simulate for 100 steps.
    traci.simulationStep()
    traffic_data = get_traffic_data()
    
    # Generate filename based on timestamp.
    filename = f"traffic_data_{traffic_data['timestamp']}.json"
    
    # Save data to JSON file.
    with open(filename, "w") as f:
        json.dump(traffic_data, f, indent=4)

# Close SUMO.
traci.close()