import { Text, TextField } from "@radix-ui/themes";

interface Props {
    label: string;
    name: string;
    value: number | string;
    onChange: (val: string) => void;
    step?: number;
    type?: "number";
}

export const ControlField = ({
    label,
    name,
    value,
    onChange,
    step,
    type = "number",
}: Props) => (
    <label htmlFor={name}>
        <Text as="div" size="2" mb="1" weight="bold">
            {label}
        </Text>
        <TextField.Root
            name={name}
            type={type}
            step={step}
            placeholder={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </label>
);
