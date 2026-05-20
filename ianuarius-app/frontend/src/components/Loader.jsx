export default function Loader({ fullScreen = false }) {
	const loader = (
		<div className="anim-carga">
			<div className="anim-carga__bola" />
			<div className="anim-carga__bola" />
			<div className="anim-carga__bola" />
			<div className="anim-carga__bola" />
		</div>
	);

	if (fullScreen) {
		return (
			<div className="bg-oscuro min-h-screen flex items-center justify-center">
				{loader}
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center py-16">
			{loader}
		</div>
	);
}
