import requests

def main():
    print("Welcome to the AI Assistant!")
    print("Type your query below and the AI will provide suggestions based on Nebula APIs.")

    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break

        # Send the query to the /solve endpoint
        try:
            response = requests.post(
                "http://127.0.0.1:5003/solve",
                json={"query": user_input},
            )

            if response.status_code == 200:
                ai_response = response.json().get("response", "No response from AI")
                print(f"AI: {ai_response}")
            else:
                print("AI: Failed to process your query. Please try again.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
