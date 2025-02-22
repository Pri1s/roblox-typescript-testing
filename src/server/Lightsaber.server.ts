const players = game.GetService("Players");
const replicatedStorage = game.GetService("ReplicatedStorage");

function attachLightsaber(character: Model) {
	const tano = replicatedStorage
		.FindFirstChild("Assets")!
		.FindFirstChild("Hilts")!
		.FindFirstChild("Lore")!
		.FindFirstChild("Tano") as Model;

	const lightsaber = tano.Clone();
	lightsaber.Name = "Lightsaber";

	// Setup Unequip weld
	const unequipPart = lightsaber.FindFirstChild("Unequip") as BasePart;
	const unequipWeld = unequipPart.FindFirstChild("Weld") as Weld;
	const unequipAttachTo = unequipPart.GetAttribute("AttachTo") as string;
	const unequipBodyPart = character.FindFirstChild(unequipAttachTo) as BasePart;
	unequipWeld.Part1 = unequipBodyPart;
	unequipWeld.Enabled = true;

	// Setup Equip weld
	const equipPart = lightsaber.FindFirstChild("Equip") as BasePart;
	const equipWeld = equipPart.FindFirstChild("Weld") as Weld;
	const equipAttachTo = equipPart.GetAttribute("AttachTo") as string;
	const equipBodyPart = character.FindFirstChild(equipAttachTo) as BasePart;
	equipWeld.Part1 = equipBodyPart;

	lightsaber.Parent = character;
}

// Handle existing players
players.GetPlayers().forEach((player) => {
	if (player.Character) {
		attachLightsaber(player.Character);
	}
});

// Handle new players and their characters
players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((character) => {
		attachLightsaber(character);
	});
});
