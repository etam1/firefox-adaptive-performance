// import { Switch } from "radix-ui";
import * as Switch from "@radix-ui/react-switch";  // ← Fix import (add *)

import "./Switch.css";

const SwitchDemo = ({ checked, onCheckedChange }) => (
		<div style={{ display: "flex", alignItems: "center" }}>
			<Switch.Root className="SwitchRoot" 
			checked={checked}  // ← ADD THIS
    onCheckedChange={onCheckedChange}  // ← ADD THIS
			>
				<Switch.Thumb className="SwitchThumb" />
			</Switch.Root>
		</div>
);

export default SwitchDemo;
