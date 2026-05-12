import { Text, TextField } from "@radix-ui/themes";

interface Props {
    label: string;
    name: string;
    defaultValue: number;
    step?: number;
    type?: "number";
}

export const ControlField = ({
    label,
    name,
    defaultValue,
    step,
    type = "number",
}: Props) => {
    return (
        <label htmlFor={name}>
            <Text as="div" size="2" mb="1" weight="bold">
                {label}
            </Text>
            <TextField.Root
                name={name}
                type={type}
                step={step}
                placeholder={label}
                defaultValue={defaultValue}
            />
        </label>
    );
};
