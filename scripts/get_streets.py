
# this script reads the following files: /Users/yosefshachnovsky/Downloads/ashdod_streets.json
# and /Users/yosefshachnovsky/Downloads/ashdod/ashkelon_streets.json
# and /Users/yosefshachnovsky/Downloads/ashdod/haifa_streets.json
# and combines them into one file with key "ashdod" and "ashkelon" and "haifa"
# and saves it to current directory ../publisher/israeliStreets/streets.json
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Union


def get_streets() -> Dict[str, List[Dict[str, Union[str, float]]]]:
    """
    Reads the streets from the json files and returns a dictionary with the city name as the key and the streets as the value.
    """
    # Define the path to the directory containing the JSON files
    dir_path = Path(__file__).parent.parent / "publisher" / "israeliStreets"
    
    # Initialize an empty dictionary to store the streets data
    streets_data = {}

    # Iterate over each JSON file in the directory
    paths = [{"full_path": "/Users/yosefshachnovsky/Downloads/{}_streets.json".format(city),
              "name": city} for city in ["ashdod", "ashkelon", "haifa"]]
    for item  in paths:
        # Read the JSON file
        with open(item.get("full_path"), "r", encoding="utf-8") as f:
            data = json.load(f)
            # Extract the city name from the file name (without extension)
            city_name = item.get("name")
            # Store the data in the dictionary with city name as key
            streets_data[city_name] = data

    return streets_data
def save_streets(streets_data: Dict[str, List[Dict[str, Union[str, float]]]]) -> None:
    """
    Saves the streets data to a JSON file.
    """ 
    # Define the path to the output JSON file
    output_path = Path(__file__).parent.parent / "publisher" / "israeliStreets" / "streets.json"
    
    # Write the streets data to the output JSON file
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(streets_data, f, ensure_ascii=False, indent=4)
    print(f"Saved streets data to {output_path}")
def main() -> None:
    """
    Main function to get and save streets data.
    """ 
    # Get the streets data
    streets_data = get_streets()
    
    # Save the streets data to a JSON file
    save_streets(streets_data)
if __name__ == "__main__":
    # Set up logging configuration
    
    # Call the main function
    main()
# The script reads street data from JSON files located in a specific directory, combines them into a single dictionary, and saves the combined data to a new JSON file.
# The script uses the `json` module to read and write JSON files, the `pathlib` module to handle file paths, and the `loguru` module for logging.
# The script is designed to be run as a standalone program, and it includes a main function that orchestrates the reading and writing of the street data.
# The script is intended to be run in an environment where the specified JSON files are present in the specified directory.