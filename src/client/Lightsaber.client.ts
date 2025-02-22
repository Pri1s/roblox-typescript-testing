import { Lightsaber } from "shared/Classes/Lightsaber";
import FormI from "shared/Settings/Forms/I";

const players = game.GetService("Players");
const userInputService = game.GetService("UserInputService");

// Initialize the lightsaber with Form I
const lightsaber = new Lightsaber(players.LocalPlayer, FormI);

// Handle keyboard input
userInputService.InputBegan.Connect((input, gameProcessedEvent) => {
	if (gameProcessedEvent) return;

	switch (input.KeyCode) {
		case Enum.KeyCode.L:
			if (lightsaber.getCurrentState() === "Out") {
				lightsaber.equip();
			} else if (lightsaber.getCurrentState() === "Idle") {
				lightsaber.unequip();
			}
			break;
	}
});

// Handle mouse input
userInputService.InputBegan.Connect((input, gameProcessedEvent) => {
	if (gameProcessedEvent) return;

	if (input.UserInputType === Enum.UserInputType.MouseButton1) {
		lightsaber.attack();
	} else if (input.UserInputType === Enum.UserInputType.MouseButton2) {
		lightsaber.startBlock();
	}
});

userInputService.InputEnded.Connect((input, gameProcessedEvent) => {
	if (gameProcessedEvent) return;

	if (input.UserInputType === Enum.UserInputType.MouseButton2) {
		lightsaber.endBlock();
	}
});
