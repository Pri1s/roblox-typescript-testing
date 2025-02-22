export interface ILightsaberForm {
	// Camera settings
	CAMERA_OFFSET: Vector3;
	CAMERA_FOV: {
		DEFAULT: number;
		COMBAT: number;
	};

	// Animation settings
	EQUIP_TIME: number;
	ATTACK_TIME: number;

	// Movement settings
	COMBAT_WALK_SPEED: number;
	DEFAULT_WALK_SPEED: number;
}
