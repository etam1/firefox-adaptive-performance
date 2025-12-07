import { Switch } from "radix-ui";
import "./Switch.css";

const SwitchDemo = () => (
	<form>
		<div style={{ display: "flex", alignItems: "center" }}>
			<Switch.Root className="SwitchRoot" id="airplane-mode">
				<Switch.Thumb className="SwitchThumb" />
			</Switch.Root>
		</div>
	</form>
);

export default SwitchDemo;
