const players = game.GetService("Players");
const userInputService = game.GetService("UserInputService");
const tweenService = game.GetService("TweenService");

// Global declarations
declare const _G: {
	ForceShiftLock: boolean;
};

interface GameSettings {
	RotationType: Enum.RotationType;
}

interface UserSettingsType {
	GameSettings: GameSettings;
}

declare function UserSettings(): UserSettingsType;

type LightsaberState = "Out" | "Equip" | "Idle" | "Attack" | "Block" | "Unequip";

class LightsaberStateMachine {
	private currentState: LightsaberState = "Out";

	public getCurrentState(): LightsaberState {
		return this.currentState;
	}

	public transition(newState: LightsaberState) {
		const validTransitions = this.getValidTransitions();
		if (validTransitions.includes(newState)) {
			this.currentState = newState;
			print(`Current State: ${this.currentState}`);
		} else {
			print(`Invalid transition from ${this.currentState} to ${newState}`);
		}
	}

	private getValidTransitions(): LightsaberState[] {
		switch (this.currentState) {
			case "Out":
				return ["Equip"];
			case "Equip":
				return ["Idle"];
			case "Idle":
				return ["Attack", "Block", "Unequip"];
			case "Attack":
				return ["Idle"];
			case "Block":
				return ["Idle"];
			case "Unequip":
				return ["Out"];
			default:
				return [];
		}
	}
}

class LightsaberController {
	private stateMachine: LightsaberStateMachine;
	private player: Player;
	private camera: Camera;
	private humanoid?: Humanoid;

	private readonly CAMERA_OFFSET = new Vector3(1.5, 0, 0);
	private readonly CAMERA_FOV = {
		DEFAULT: 70,
		COMBAT: 80,
	};
	private readonly TWEEN_INFO = new TweenInfo(0.5);

	constructor() {
		this.stateMachine = new LightsaberStateMachine();
		this.player = players.LocalPlayer;
		this.camera = game.GetService("Workspace").CurrentCamera!;
		this.setupCharacter();
	}

	private setupCharacter() {
		if (this.player.Character || this.player.CharacterAdded) {
			this.onCharacterAdded(this.player.Character || undefined);
		}

		this.player.CharacterAdded.Connect((char) => this.onCharacterAdded(char));
	}

	private onCharacterAdded(character: Model | undefined) {
		if (!character) return;
		this.humanoid = character.WaitForChild("Humanoid") as Humanoid;
	}

	private setCameraLock(enable: boolean, withTransition = true) {
		if (!this.humanoid) return;

		if (enable) {
			// Enable shift lock and lock mouse
			_G.ForceShiftLock = true;
			UserSettings().GameSettings.RotationType = Enum.RotationType.CameraRelative;
			userInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;

			// Tween camera FOV and offset
			const currentOffset = this.humanoid.CameraOffset;
			if (
				currentOffset.X !== this.CAMERA_OFFSET.X ||
				currentOffset.Y !== this.CAMERA_OFFSET.Y ||
				currentOffset.Z !== this.CAMERA_OFFSET.Z
			) {
				tweenService
					.Create(this.camera, new TweenInfo(this.TWEEN_INFO.Time / 1.5), {
						FieldOfView: this.CAMERA_FOV.COMBAT,
					})
					.Play();

				tweenService.Create(this.humanoid, this.TWEEN_INFO, { CameraOffset: this.CAMERA_OFFSET }).Play();
			}
		} else {
			// Disable shift lock and unlock mouse
			_G.ForceShiftLock = false;
			UserSettings().GameSettings.RotationType = Enum.RotationType.MovementRelative;
			userInputService.MouseBehavior = Enum.MouseBehavior.Default;

			// Reset camera FOV and offset
			const currentOffset = this.humanoid.CameraOffset;
			if (currentOffset.X !== 0 || currentOffset.Y !== 0 || currentOffset.Z !== 0) {
				tweenService
					.Create(this.camera, new TweenInfo(this.TWEEN_INFO.Time / 1.5), {
						FieldOfView: this.CAMERA_FOV.DEFAULT,
					})
					.Play();

				if (withTransition) {
					tweenService.Create(this.humanoid, this.TWEEN_INFO, { CameraOffset: Vector3.zero }).Play();
				} else {
					this.humanoid.CameraOffset = Vector3.zero;
				}
			}
		}
	}

	public handleInput() {
		// Handle keyboard input
		userInputService.InputBegan.Connect((input, gameProcessedEvent) => {
			if (gameProcessedEvent) return;

			switch (input.KeyCode) {
				case Enum.KeyCode.L:
					if (this.stateMachine.getCurrentState() === "Out") {
						this.stateMachine.transition("Equip");
						this.setCameraLock(true);
						task.wait(0.5);
						this.stateMachine.transition("Idle");
					} else if (this.stateMachine.getCurrentState() === "Idle") {
						this.stateMachine.transition("Unequip");
						this.setCameraLock(false);
						task.wait(0.5);
						this.stateMachine.transition("Out");
					}
					break;
			}
		});

		// Handle mouse input
		userInputService.InputBegan.Connect((input, gameProcessedEvent) => {
			if (gameProcessedEvent) return;

			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				if (this.stateMachine.getCurrentState() === "Idle") {
					this.stateMachine.transition("Attack");
					task.wait(0.5); // Simulate attack animation
					this.stateMachine.transition("Idle");
				}
			}
		});

		userInputService.InputBegan.Connect((input, gameProcessedEvent) => {
			if (gameProcessedEvent) return;

			if (input.UserInputType === Enum.UserInputType.MouseButton2) {
				if (this.stateMachine.getCurrentState() === "Idle") {
					this.stateMachine.transition("Block");
				}
			}
		});

		userInputService.InputEnded.Connect((input, gameProcessedEvent) => {
			if (gameProcessedEvent) return;

			if (input.UserInputType === Enum.UserInputType.MouseButton2) {
				if (this.stateMachine.getCurrentState() === "Block") {
					this.stateMachine.transition("Idle");
				}
			}
		});
	}
}

// Initialize the controller
const lightsaberController = new LightsaberController();
lightsaberController.handleInput();
