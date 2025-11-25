import json
import os

def get_filename():
    name = input("Enter filename (without .json): ").strip()
    return f"{name}.json"

def load_data(filename):
    if os.path.exists(filename):
        with open(filename, "r") as file:
            return json.load(file)
    return []

def save_data(data, filename):
    with open(filename, "w") as file:
        json.dump(data, file, indent=4)
    print(f"✅ Data saved to {filename}.\n")

def delete_file():
    filename = get_filename()
    if os.path.exists(filename):
        os.remove(filename)
        print(f"🗑️ File '{filename}' deleted.\n")
    else:
        print(f"❌ File '{filename}' not found.\n")

def create_record(data):
    raw_id = input("Enter ID (numbers only): ")
    numeric_id = ''.join(filter(str.isdigit, raw_id))
    record = {
        "id": numeric_id,
        "name": input("Enter Name: "),
        "course": input("Enter Course: "),
        "year": input("Enter Year: ")
    }
    data.append(record)
    print("✅ Record added.\n")


def update_record(data):
    id_to_edit = input("Enter ID to update: ")
    for record in data:
        if record["id"] == id_to_edit:
            record["name"] = input("Enter new Name: ")
            record["course"] = input("Enter new Course: ")
            record["year"] = input("Enter new Year: ")
            print("✅ Record updated.\n")
            return
    print("❌ ID not found.\n")

def delete_record(data):
    id_to_delete = input("Enter ID to delete: ")
    for record in data:
        if record["id"] == id_to_delete:
            data.remove(record)
            print("✅ Record deleted.\n")
            return
    print("❌ ID not found.\n")

def search_record(data):
    keyword = input("Enter ID or Name to search: ").lower()
    found = False
    for record in data:
        if keyword in record["id"].lower() or keyword in record["name"].lower():
            print(record)
            found = True
    if not found:
        print("❌ No matching records found.\n")

def main():
    while True:
        print("\n📂 FILE OPTIONS")
        print("1. Create New File")
        print("2. Load Existing File")
        print("3. Delete File")
        print("4. Exit Program")
        file_choice = input("Choose an option (1-4): ")

        if file_choice == "1":
            filename = get_filename()
            data = []
            print(f"📄 Created new file: {filename}\n")

        elif file_choice == "2":
            filename = get_filename()
            data = load_data(filename)
            print(f"📄 Loaded data from {filename}\n")

        elif file_choice == "3":
            delete_file()
            continue

        elif file_choice == "4":
            print("👋 Exiting program...")
            break

        else:
            print("❌ Invalid choice.\n")
            continue

        # Record operation loop
        while True:
            print("\n📋 MENU")
            print("1. Create Record")
            print("2. Update Record")
            print("3. Delete Record")
            print("4. Search Record")
            print("5. Save Data")
            print("6. Back to File Menu")

            action = input("Enter choice (1-6): ")

            if action == "1":
                create_record(data)
            elif action == "2":
                update_record(data)
            elif action == "3":
                delete_record(data)
            elif action == "4":
                search_record(data)
            elif action == "5":
                save_data(data, filename)
            elif action == "6":
                print("↩ Returning to file menu...\n")
                break
            else:
                print("❌ Invalid choice.\n")

if __name__ == "__main__":
    main()
