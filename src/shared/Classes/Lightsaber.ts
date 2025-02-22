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

export type LightsaberState = "Out" | "Equip" | "Idle" | "Attack" | "Block" | "Unequip";

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

import { ILightsaberForm } from "./Forms/ILightsaberForm";

export class Lightsaber {
	private stateMachine: LightsaberStateMachine;
	private player: Player;
	private camera: Camera;
	private humanoid?: Humanoid;
	private form: ILightsaberForm;

	private readonly TWEEN_INFO = new TweenInfo(0.5);
	private defaultWalkSpeed: number;

	constructor(player: Player, formModule: ILightsaberForm) {
		this.stateMachine = new LightsaberStateMachine();
		this.player = player;
		this.camera = game.GetService("Workspace").CurrentCamera!;
		this.form = formModule;
		this.defaultWalkSpeed = this.form.DEFAULT_WALK_SPEED;
		this.setupCharacter();
	}

	public getCurrentState(): LightsaberState {
		return this.stateMachine.getCurrentState();
	}

	public equip() {
		if (this.getCurrentState() === "Out") {
			this.stateMachine.transition("Equip");
			this.setCameraLock(true);
			task.wait(0.5);
			this.stateMachine.transition("Idle");
		}
	}

	public unequip() {
		if (this.getCurrentState() === "Idle") {
			this.stateMachine.transition("Unequip");
			this.setCameraLock(false);
			task.wait(0.5);
			this.stateMachine.transition("Out");
		}
	}

	public attack() {
		if (this.getCurrentState() === "Idle") {
			this.stateMachine.transition("Attack");
			task.wait(0.5); // Simulate attack animation
			this.stateMachine.transition("Idle");
		}
	}

	public startBlock() {
		if (this.getCurrentState() === "Idle") {
			this.stateMachine.transition("Block");
		}
	}

	public endBlock() {
		if (this.getCurrentState() === "Block") {
			this.stateMachine.transition("Idle");
		}
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
			_G.ForceShiftLock = true;
			UserSettings().GameSettings.RotationType = Enum.RotationType.CameraRelative;
			userInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
			this.humanoid.WalkSpeed = this.form.COMBAT_WALK_SPEED;

			const currentOffset = this.humanoid.CameraOffset;
			if (
				currentOffset.X !== this.form.CAMERA_OFFSET.X ||
				currentOffset.Y !== this.form.CAMERA_OFFSET.Y ||
				currentOffset.Z !== this.form.CAMERA_OFFSET.Z
			) {
				tweenService
					.Create(this.camera, new TweenInfo(this.TWEEN_INFO.Time / 1.5), {
						FieldOfView: this.form.CAMERA_FOV.COMBAT,
					})
					.Play();

				tweenService.Create(this.humanoid, this.TWEEN_INFO, { CameraOffset: this.form.CAMERA_OFFSET }).Play();
			}
		} else {
			_G.ForceShiftLock = false;
			UserSettings().GameSettings.RotationType = Enum.RotationType.MovementRelative;
			userInputService.MouseBehavior = Enum.MouseBehavior.Default;

			const currentOffset = this.humanoid.CameraOffset;
			if (currentOffset.X !== 0 || currentOffset.Y !== 0 || currentOffset.Z !== 0) {
				tweenService
					.Create(this.camera, new TweenInfo(this.TWEEN_INFO.Time / 1.5), {
						FieldOfView: this.form.CAMERA_FOV.DEFAULT,
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
}
