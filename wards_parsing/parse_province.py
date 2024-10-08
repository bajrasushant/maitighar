import json

input_file = "province_data.txt"
output_file = "province_ward.json"

local_gov_types = {
    "Sub-Metropolitan City": "Sub-Metropolitan City",
    "Metropolitan City": "Metropolitan City",
    "Municipality": "Municipality",
    "Gaunpalika": "Gaunpalika",
}

final_data = {}

try:
    with open(input_file, "r") as file:
        for line in file:
            if line.startswith("!"):
                continue
            if len(line) > 5:
                cleaned_str = line.strip("|").strip("\n").strip()
                items = [item.strip() for item in cleaned_str.split("||")]
                (
                    province,
                    district_english,
                    district_nepali,
                    headquater,
                    area,
                    local_gov,
                    num_wards,
                ) = items

                local_gov_type = "Unknown"
                for keyword, gov_type in local_gov_types.items():
                    if keyword in local_gov:
                        local_gov_type = gov_type
                        break

                if province not in final_data:
                    final_data[province] = {"districts": []}

                district_data = next(
                    (
                        district
                        for district in final_data[province]["districts"]
                        if district["name"] == district_english
                    ),
                    None,
                )
                if not district_data:
                    district_data = {"name": district_english, "local_govs": []}
                    final_data[province]["districts"].append(district_data)

                district_data["local_govs"].append(
                    {
                        "name": local_gov,
                        "number_of_wards": num_wards,
                        "type": local_gov_type,
                    }
                )
            else:
                continue

except FileNotFoundError:
    print(f"Error: The file '{input_file}' was not found.")
except Exception as e:
    print(f"An error occurred: {e}")

output_data = []
for province, data in final_data.items():
    output_data.append({"province": province, "districts": data["districts"]})
try:
    with open(output_file, "w") as json_file:
        json.dump(output_data, json_file, indent=4)  # Use indent for pretty printing
    print(f"Data successfully written to '{output_file}'.")
except Exception as e:
    print(f"An error occurred while writing to the JSON file: {e}")
