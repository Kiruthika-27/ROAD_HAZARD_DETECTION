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
data_list = []
for step in range(100):  # Simulate for 100 steps.
    traci.simulationStep()
    data_list.append(get_traffic_data())

# Save data to JSON file.
with open("traffic_data.json", "w") as f:
    json.dump(data_list, f, indent=4)

# Close SUMO.
traci.close()
