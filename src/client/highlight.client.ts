const Players = game.GetService("Players");
const userInputService = game.GetService("UserInputService");

const player = Players.LocalPlayer;

let character = player.Character;
let highlight: Highlight | undefined;

// Listen for key press
userInputService.InputBegan.Connect((input, gameProcessed) => {
	if (gameProcessed) return; // Ignore inputs processed by the game

	if (input.KeyCode === Enum.KeyCode.E) {
		if (!highlight) {
			// Create new highlight
			highlight = new Instance("Highlight");
			highlight.DepthMode = Enum.HighlightDepthMode.Occluded;
			highlight.FillTransparency = 1;
			highlight.OutlineColor = new Color3(1, 0.67, 0.42);
			if (character) {
				highlight.Parent = character;
			}
		} else {
			// Remove existing highlight
			highlight.Destroy();
			highlight = undefined;
		}
	}
});

// Handle character respawning
player.CharacterAdded.Connect((newCharacter) => {
	character = newCharacter; // Update character reference

	// Remove old highlight if it exists
	if (highlight) {
		highlight.Destroy();
		highlight = undefined;
	}
});
