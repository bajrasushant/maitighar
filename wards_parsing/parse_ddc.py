import json
from typing_extensions import OrderedDict

input_file = "ddc.txt"
with open("province_nepali_map.json", "r", encoding="utf-8") as province_file:
    province_mapping = json.load(province_file)

with open("district_nepali_map.json", "r", encoding="utf-8") as district_file:
    district_mapping = json.load(district_file)

with open("province_ward.json", "r", encoding="utf-8") as main_data_file:
    json_data = json.load(main_data_file)

final_data = {}


def map_nepali_to_english(text):
    for nepali_province, english_province in province_mapping.items():
        if nepali_province in text:
            text = text.replace(nepali_province, english_province)

    for nepali_district, english_district in district_mapping.items():
        if nepali_district in text:
            text = text.replace(nepali_district, english_district)

    return text


def update_district_with_contacts(
    province_name, district_name, contact_email, contact_number
):
    english_province = map_nepali_to_english(province_name)
    english_district = map_nepali_to_english(district_name)

    for province in json_data:
        if province["province"] == english_province:
            for district in province["districts"]:
                if district["name"] == english_district:
                    reordered_district = OrderedDict(
                        [
                            ("name", district["name"]),
                            ("ddc_contact_email", contact_email),
                            ("ddc_contact_number", contact_number),
                            ("local_govs", district["local_govs"]),
                        ]
                    )

                    district.clear()
                    district.update(reordered_district)
                    return


try:
    with open(input_file, "r") as file:
        for line in file:
            data = line.split("\t")
            province_name = data[1].split()[0]
            district_name = data[2]
            contact_email = data[5]
            contact_number = data[6]
            update_district_with_contacts(
                province_name, district_name, contact_email, contact_number
            )


except FileNotFoundError:
    print(f"Error: The file '{input_file}' was not found.")
except Exception as e:
    print(f"An error occurred: {e}")

try:
    with open("province_ward.json", "w", encoding="utf-8") as main_data_file:
        json.dump(json_data, main_data_file, ensure_ascii=False, indent=4)
    print("Data successfully written.")
except Exception as e:
    print(f"An error occurred while writing to the JSON file: {e}")
