const Players = game.GetService("Players");
const userInputService = game.GetService("UserInputService");
const runService = game.GetService("RunService");

const player = Players.LocalPlayer;
if (!player) throw "This script must be a LocalScript.";

let character = player.Character || player.CharacterAdded.Wait()[0];
let humanoid = character?.FindFirstChild("Humanoid") as Humanoid;
let isSpeeding = false;
const normalSpeed = 16;
const superSpeed = 50;

// Handle character respawning
player.CharacterAdded.Connect((newCharacter) => {
	character = newCharacter;
	humanoid = character.FindFirstChild("Humanoid") as Humanoid;
	isSpeeding = false;
	if (humanoid) {
		humanoid.WalkSpeed = normalSpeed;
	}
});

// Toggle super speed with Left Shift key
userInputService.InputBegan.Connect((input, gameProcessed) => {
	if (gameProcessed) return;

	if (input.KeyCode === Enum.KeyCode.LeftShift && humanoid) {
		isSpeeding = true;
		humanoid.WalkSpeed = superSpeed;
	}
});

userInputService.InputEnded.Connect((input) => {
	if (input.KeyCode === Enum.KeyCode.LeftShift && humanoid) {
		isSpeeding = false;
		humanoid.WalkSpeed = normalSpeed;
	}
});
