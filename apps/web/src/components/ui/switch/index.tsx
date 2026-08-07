import { ReactNode, useId } from "react";
import "./style.css";

interface SwitchProps {
    /** Trạng thái on/off (controlled) */
    checked: boolean;
    /** Callback khi user toggle */
    onChange: (checked: boolean) => void;
    /** Vô hiệu hoá switch */
    disabled?: boolean;
    /** Label hiển thị bên cạnh switch, cũng dùng cho aria-label */
    label?: string;
    /** Kích thước switch */
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Switch({
    checked,
    onChange,
    disabled = false,
    label,
    size = "md",
    className,
}: SwitchProps): ReactNode {
    const id = useId();

    return (
<label className="switch">
    <input type="checkbox" />
    <span className="slider"></span>
</label>
    );
}